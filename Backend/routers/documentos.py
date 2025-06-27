from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import os
import shutil

from db.models import CVDocumento
from schemas.documento import DocumentoResponse
from db.conexion_db import get_db
from utils.pdf_utils import extraer_texto_desde_pdf

router = APIRouter(prefix="/documentos", tags=["Documentos (CV)"])


UPLOAD_FOLDER = "uploaded_docs"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/", response_model=DocumentoResponse)
def subir_documento_cv(
    candidato_id: int = Form(...),
    archivo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Guardar el archivo en disco
    file_path = os.path.join(UPLOAD_FOLDER, archivo.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(archivo.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el archivo: {e}")

    # Extraer texto del PDF
    texto_extraido = extraer_texto_desde_pdf(file_path)
    if not texto_extraido:
        raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF")

    # Crear y guardar documento
    nuevo_doc = CVDocumento(
        candidato_id=candidato_id,
        nombre_archivo=archivo.filename,
        ruta_archivo=file_path,
        texto_extraido=texto_extraido
    )

    db.add(nuevo_doc)
    db.commit()
    db.refresh(nuevo_doc)

    return nuevo_doc


@router.get("/", response_model=List[DocumentoResponse])
def listar_documentos(db: Session = Depends(get_db)):
    return db.query(CVDocumento).all()


@router.get("/{documento_id}", response_model=DocumentoResponse)
def obtener_documento(documento_id: int, db: Session = Depends(get_db)):
    documento = db.query(CVDocumento).get(documento_id)
    if not documento:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return documento
