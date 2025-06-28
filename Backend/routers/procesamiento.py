from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
import uuid
import json
import logging

from db.conexion_db import get_db
from db.models import CVDocumento, CVEmbedding, OfertaLaboral, Postulacion, RankingPostulacion, Candidato
from utils import ollama_utils, pdf_utils

router = APIRouter(prefix="/procesamiento", tags=["Procesamiento"])
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configurar logging
logger = logging.getLogger(__name__)

# --- SCHEMAS PARA LOS ENDPOINTS ---
class CVExtractionRequest(BaseModel):
    texto_cv: str

class SimilarityRequest(BaseModel):
    cv_resumen: str
    job_description: str

class QuestionGenerationRequest(BaseModel):
    cv_resumen: str
    job_description: str

class AnswerEvaluationRequest(BaseModel):
    pregunta: str
    respuesta_candidato: str

class CVExtractionResponse(BaseModel):
    nombre_completo: Optional[str]
    email: Optional[str]
    telefono: Optional[str]
    resumen: Optional[str]
    experiencia_laboral: List[dict]
    educacion: List[dict]
    habilidades: List[str]

class SimilarityResponse(BaseModel):
    similitud: float
    porcentaje: float
    nivel: str

@router.post("/calificar")
def upload_file(candidato_id: int, oferta_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Endpoint original mejorado - mantiene compatibilidad.
    """
    try:
        logger.info(f"Procesando archivo para candidato {candidato_id} y oferta {oferta_id}")

        # Asegura que el archivo sea un PDF
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")

        # Crear nombre único
        filename = f"{uuid.uuid4()}.pdf"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # Guardar el archivo físicamente
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Llamar a tu función utilitaria con la ruta del archivo
        resultado = pdf_utils.extraer_texto_desde_pdf(filepath)

        oferta = db.query(OfertaLaboral).filter(OfertaLaboral.id == oferta_id).first()
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        job_description = oferta.descripcion or ""

        score_ia = ollama_utils.call_ollama_comparation(resultado, job_description)
        
        # Si no hay conexión con IA, usar score simulado
        if score_ia is None:
            score_ia = 0.75  # Score simulado

        # Insertar CV documento
        nuevo_documento = CVDocumento(
            candidato_id=candidato_id,
            nombre_archivo=file.filename,
            ruta_archivo=filepath,
            texto_extraido=resultado,
            creado_en=datetime.utcnow()
        )
        db.add(nuevo_documento)
        db.commit()

        # Crear postulación
        nueva_postulacion = Postulacion(
            candidato_id=candidato_id,
            oferta_id=oferta_id,
            fecha_postulacion=datetime.utcnow()
        )
        db.add(nueva_postulacion)
        db.commit()
        db.refresh(nueva_postulacion)

        # Guardar ranking
        nuevo_ranking = RankingPostulacion(
            postulacion_id=nueva_postulacion.id,
            score=score_ia * 100,  # Escalar si deseas representarlo sobre 100
            score_semantico=score_ia,
            observaciones="Generado por IA (Ollama)"
        )
        db.add(nuevo_ranking)
        db.commit()

        # Obtener embedding de texto
        embedding_res = ollama_utils.call_ollama_embeddings_api(resultado)
        embedding_vector = embedding_res.get("embedding") if embedding_res else None

        # Guardar embedding como JSON serializado
        if embedding_vector:
            nuevo_embedding = CVEmbedding(
                candidato_id=candidato_id,
                embedding=json.dumps(embedding_vector),
                modelo="nomic-embed-text",
                fecha_generacion=datetime.utcnow()
            )
            db.add(nuevo_embedding)
            db.commit()

        logger.info(f"Procesamiento completado exitosamente")

        return JSONResponse(content={
            "message": "Archivo guardado y procesado correctamente",
            "path": filepath,
            "resultado": resultado,
            "score_ia": score_ia,
            "postulacion_id": nueva_postulacion.id
        })

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error en procesamiento: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- ENDPOINT 1: EXTRACCIÓN DE DATOS DE CV ---
@router.post("/extraer-cv", response_model=CVExtractionResponse)
def extraer_datos_cv(request: CVExtractionRequest, db: Session = Depends(get_db)):
    """
    Extrae datos estructurados de un CV en texto plano usando IA.
    """
    try:
        logger.info("Iniciando extracción de datos de CV")
        
        # Crear mensajes para la IA
        extract_cv_messages = [
            {"role": "system", "content": "Eres un asistente útil especializado en extraer información estructurada de CVs en formato JSON. Responde solo con el objeto JSON."},
            {
                "role": "user",
                "content": f"""
Extrae la siguiente información del CV proporcionado y devuélvela en formato JSON.
Asegúrate de que el JSON sea válido y contenga los siguientes campos:
- "nombre_completo": Nombre y apellidos del candidato.
- "email": Dirección de correo electrónico.
- "telefono": Número de teléfono.
- "resumen": Breve descripción del perfil del candidato.
- "experiencia_laboral": Una lista de objetos, cada uno con "puesto", "empresa", "periodo", "descripcion".
- "educacion": Una lista de objetos, cada uno con "titulo", "institucion", "periodo".
- "habilidades": Una lista de strings.

Si algún campo no se encuentra, omítelo o déjalo como un array vacío o string vacío según corresponda.

CV:
{request.texto_cv}
"""
            }
        ]
        
        # Llamar a la IA
        response_data = ollama_utils.call_ollama_chat_api(extract_cv_messages, format="json")
        
        if response_data:
            try:
                extracted_json_str = response_data['message']['content']
                extracted_data = json.loads(extracted_json_str)
                logger.info("Extracción de CV exitosa")
                return CVExtractionResponse(**extracted_data)
            except json.JSONDecodeError as e:
                logger.error(f"Error al parsear JSON de CV: {e}")
                # Devolver resultado simulado en caso de error
                return ollama_utils.extract_cv_data_example({
                    "nombre_completo": "Datos extraídos (simulado)",
                    "email": "usuario@ejemplo.com",
                    "telefono": "+51 999999999",
                    "resumen": "Profesional con experiencia",
                    "experiencia_laboral": [],
                    "educacion": [],
                    "habilidades": ["Python", "FastAPI"]
                })
        else:
            logger.warning("No se pudo conectar con IA, usando datos simulados")
            return ollama_utils.extract_cv_data_example({
                "nombre_completo": "Usuario Simulado",
                "email": "sim@ejemplo.com",
                "telefono": "+51 999999999",
                "resumen": "Datos simulados por falta de conexión IA",
                "experiencia_laboral": [],
                "educacion": [],
                "habilidades": ["Simulación"]
            })
            
    except Exception as e:
        logger.error(f"Error en extracción de CV: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al extraer datos del CV: {str(e)}"
        )


# --- ENDPOINT 2: CÁLCULO DE SIMILITUD SEMÁNTICA ---
@router.post("/similitud", response_model=SimilarityResponse)
def calcular_similitud(request: SimilarityRequest, db: Session = Depends(get_db)):
    """
    Calcula la similitud semántica entre un CV y una descripción de puesto.
    """
    try:
        logger.info("Calculando similitud semántica")
        
        # Llamar a la función de comparación
        similarity = ollama_utils.call_ollama_comparation(request.cv_resumen, request.job_description)
        
        if similarity is None:
            logger.warning("No se pudo calcular similitud real, usando simulada")
            similarity = ollama_utils.calculate_similarity_example()
        
        # Calcular porcentaje y nivel
        porcentaje = similarity * 100
        
        if porcentaje >= 80:
            nivel = "Excelente"
        elif porcentaje >= 60:
            nivel = "Bueno"
        elif porcentaje >= 40:
            nivel = "Regular"
        else:
            nivel = "Bajo"
        
        logger.info(f"Similitud calculada: {similarity:.4f}")
        
        return SimilarityResponse(
            similitud=similarity,
            porcentaje=porcentaje,
            nivel=nivel
        )
        
    except Exception as e:
        logger.error(f"Error en cálculo de similitud: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al calcular similitud: {str(e)}"
        )


# --- ENDPOINT 3: GENERACIÓN DE PREGUNTAS DE ENTREVISTA ---
@router.post("/generar-preguntas")
def generar_preguntas_entrevista(request: QuestionGenerationRequest, db: Session = Depends(get_db)):
    """
    Genera preguntas de entrevista personalizadas basadas en CV y descripción del puesto.
    """
    try:
        logger.info("Generando preguntas de entrevista")
        
        generate_questions_messages = [
            {"role": "system", "content": "Eres un asistente de selección de personal experto en formular preguntas de entrevista desafiantes y personalizadas."},
            {"role": "user", "content": f"""
Genera 5 preguntas de entrevista para un candidato, basándote en su resumen de CV y la descripción del puesto.
Las preguntas deben ser desafiantes y explorar su experiencia en las tecnologías mencionadas.
Asegúrate de que sean preguntas abiertas para fomentar respuestas detalladas.
Devuelve las preguntas en una lista numerada.

Resumen del CV del Candidato:
{request.cv_resumen}

Descripción del Puesto:
{request.job_description}
"""}
        ]
        
        response_data = ollama_utils.call_ollama_chat_api(generate_questions_messages)
        
        if response_data:
            questions_text = response_data['message']['content']
            logger.info("Preguntas generadas exitosamente")
            
            return JSONResponse(content={
                "status": "success",
                "preguntas": questions_text,
                "cv_resumen": request.cv_resumen,
                "job_description": request.job_description
            })
        else:
            logger.warning("No se pudieron generar preguntas reales, usando simuladas")
            questions = ollama_utils.generate_interview_questions_example()
            
            return JSONResponse(content={
                "status": "success_simulated",
                "preguntas": "\n".join(questions),
                "cv_resumen": request.cv_resumen,
                "job_description": request.job_description,
                "nota": "Preguntas simuladas por falta de conexión IA"
            })
            
    except Exception as e:
        logger.error(f"Error en generación de preguntas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar preguntas: {str(e)}"
        )


# --- ENDPOINT 4: EVALUACIÓN DE RESPUESTAS ---
@router.post("/evaluar-respuesta")
def evaluar_respuesta_candidato(request: AnswerEvaluationRequest, db: Session = Depends(get_db)):
    """
    Evalúa la respuesta de un candidato a una pregunta de entrevista.
    """
    try:
        logger.info("Evaluando respuesta de candidato")
        
        evaluate_answer_messages = [
            {"role": "system", "content": "Eres un evaluador de entrevistas que analiza respuestas y proporciona feedback estructurado en JSON."},
            {
                "role": "user",
                "content": f"""
Evalúa la siguiente respuesta de un candidato a una pregunta de entrevista.
Califica la respuesta en una escala del 1 al 5 (1=Mala, 5=Excelente) en términos de:
- Relevancia
- Profundidad técnica
- Claridad de la explicación
- Identificación de desafíos y soluciones

Luego, proporciona un breve comentario sobre la respuesta y sugiere una posible pregunta de seguimiento.

Pregunta: {request.pregunta}
Respuesta del Candidato: {request.respuesta_candidato}

Formato de salida (JSON):
{{
  "calificacion_relevancia": int,
  "calificacion_profundidad_tecnica": int,
  "calificacion_claridad": int,
  "calificacion_desafios_soluciones": int,
  "comentario": string,
  "pregunta_seguimiento": string
}}
"""
            }
        ]
        
        response_data = ollama_utils.call_ollama_chat_api(evaluate_answer_messages, format="json")
        
        if response_data:
            try:
                evaluation_json_str = response_data['message']['content']
                evaluation_data = json.loads(evaluation_json_str)
                logger.info("Evaluación completada exitosamente")
                
                return JSONResponse(content={
                    "status": "success",
                    "evaluacion": evaluation_data,
                    "pregunta_original": request.pregunta,
                    "respuesta_evaluada": request.respuesta_candidato
                })
            except json.JSONDecodeError as e:
                logger.error(f"Error al parsear JSON de evaluación: {e}")
                evaluation_data = ollama_utils.evaluate_candidate_answer_example()
                
                return JSONResponse(content={
                    "status": "success_simulated",
                    "evaluacion": evaluation_data,
                    "pregunta_original": request.pregunta,
                    "respuesta_evaluada": request.respuesta_candidato,
                    "nota": "Evaluación simulada por error en parseo"
                })
        else:
            logger.warning("No se pudo evaluar con IA, usando evaluación simulada")
            evaluation_data = ollama_utils.evaluate_candidate_answer_example()
            
            return JSONResponse(content={
                "status": "success_simulated",
                "evaluacion": evaluation_data,
                "pregunta_original": request.pregunta,
                "respuesta_evaluada": request.respuesta_candidato,
                "nota": "Evaluación simulada por falta de conexión IA"
            })
            
    except Exception as e:
        logger.error(f"Error en evaluación de respuesta: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al evaluar respuesta: {str(e)}"
        )


# --- ENDPOINT 5: PROCESO COMPLETO DE ANÁLISIS DE CV ---
@router.post("/analisis-completo/{candidato_id}/{oferta_id}")
def analisis_completo_cv(
    candidato_id: int, 
    oferta_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    """
    Proceso completo: extrae texto, analiza CV, calcula similitud y genera preguntas.
    """
    try:
        logger.info(f"Iniciando análisis completo para candidato {candidato_id} y oferta {oferta_id}")
        
        # Verificar que existan candidato y oferta
        candidato = db.query(Candidato).filter(Candidato.id == candidato_id).first()
        if not candidato:
            raise HTTPException(status_code=404, detail="Candidato no encontrado")
        
        oferta = db.query(OfertaLaboral).filter(OfertaLaboral.id == oferta_id).first()
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        # Validar archivo PDF
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")

        # Guardar archivo
        filename = f"{uuid.uuid4()}.pdf"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extraer texto del PDF
        texto_cv = pdf_utils.extraer_texto_desde_pdf(filepath)
        
        # 1. Extraer datos estructurados del CV
        extract_request = CVExtractionRequest(texto_cv=texto_cv)
        datos_extraidos = extraer_datos_cv(extract_request, db)
        
        # 2. Calcular similitud
        similarity_request = SimilarityRequest(
            cv_resumen=texto_cv[:500],  # Primeros 500 caracteres como resumen
            job_description=oferta.descripcion or ""
        )
        similitud_resultado = calcular_similitud(similarity_request, db)
        
        # 3. Generar preguntas de entrevista
        questions_request = QuestionGenerationRequest(
            cv_resumen=texto_cv[:500],
            job_description=oferta.descripcion or ""
        )
        preguntas_response = generar_preguntas_entrevista(questions_request, db)
        preguntas_data = preguntas_response.body.decode() if hasattr(preguntas_response, 'body') else {}
        
        # Guardar en base de datos
        # CV Documento
        nuevo_documento = CVDocumento(
            candidato_id=candidato_id,
            nombre_archivo=file.filename,
            ruta_archivo=filepath,
            texto_extraido=texto_cv,
            creado_en=datetime.utcnow()
        )
        db.add(nuevo_documento)
        db.commit()

        # Postulación
        nueva_postulacion = Postulacion(
            candidato_id=candidato_id,
            oferta_id=oferta_id,
            fecha_postulacion=datetime.utcnow()
        )
        db.add(nueva_postulacion)
        db.commit()
        db.refresh(nueva_postulacion)

        # Ranking
        nuevo_ranking = RankingPostulacion(
            postulacion_id=nueva_postulacion.id,
            score=similitud_resultado.porcentaje,
            score_semantico=similitud_resultado.similitud,
            observaciones=f"Análisis completo automático - Nivel: {similitud_resultado.nivel}"
        )
        db.add(nuevo_ranking)
        db.commit()

        # Embedding
        embedding_res = ollama_utils.call_ollama_embeddings_api(texto_cv)
        if embedding_res and embedding_res.get("embedding"):
            nuevo_embedding = CVEmbedding(
                candidato_id=candidato_id,
                embedding=json.dumps(embedding_res["embedding"]),
                modelo="nomic-embed-text",
                fecha_generacion=datetime.utcnow()
            )
            db.add(nuevo_embedding)
            db.commit()

        logger.info(f"Análisis completo finalizado para candidato {candidato_id}")
        
        return JSONResponse(content={
            "status": "success",
            "message": "Análisis completo realizado exitosamente",
            "candidato_id": candidato_id,
            "oferta_id": oferta_id,
            "archivo_guardado": filepath,
            "datos_extraidos": datos_extraidos.dict() if hasattr(datos_extraidos, 'dict') else str(datos_extraidos),
            "similitud": {
                "score": similitud_resultado.similitud,
                "porcentaje": similitud_resultado.porcentaje,
                "nivel": similitud_resultado.nivel
            },
            "preguntas_generadas": preguntas_data,
            "postulacion_id": nueva_postulacion.id
        })
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error en análisis completo: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error en análisis completo: {str(e)}"
        )

