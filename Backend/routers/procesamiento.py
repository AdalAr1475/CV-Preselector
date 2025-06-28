from datetime import datetime
from fastapi import APIRouter, Depends, FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
import uuid

from requests import Session
from db.conexion_db import get_db
from db.models import CVDocumento, CVEmbedding, OfertaLaboral, Postulacion, RankingPostulacion
from utils import ollama_utils, pdf_utils  # tu función utilitaria
router = APIRouter(prefix="/procesamiento", tags=["Procesamiento"])
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/calificar")
def upload_file(candidato_id:int, oferta_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:

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
        job_description = oferta.descripcion

        score_ia = ollama_utils.call_ollama_comparation(resultado, job_description)

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
                embedding=str(embedding_vector),  # o json.dumps(embedding_vector)
                modelo="nomic-embed-text",
                fecha_generacion=datetime.utcnow()
            )
            db.add(nuevo_embedding)
            db.commit()

        return JSONResponse(content={
            "message": "Archivo guardado y procesado correctamente",
            "path": filepath,
            "resultado": resultado,
            "score_ia": score_ia
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))