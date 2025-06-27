from fastapi import APIRouter, FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
import uuid
from utils import ollama_utils, pdf_utils  # tu función utilitaria
router = APIRouter(tags=["Procesamiento"])
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/")
def upload_file(file: UploadFile = File(...)):
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

        job_description = """
        Estamos buscando un Desarrollador Full-Stack Senior con al menos 4 años de experiencia.
        Debe tener sólidos conocimientos en Python, Django, microservicios, Docker, Kubernetes y React.
        Se valorará la experiencia en optimización de rendimiento y bases de datos NoSQL.
        """

        score_ia = ollama_utils.call_ollama_comparation(resultado, job_description)
        return JSONResponse(content={
            "message": "Archivo guardado y procesado correctamente",
            "path": filepath,
            "resultado": resultado,
            "score_ia": score_ia
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))