from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.models import Candidato
from schemas.candidato import CandidatoCreate, CandidatoResponse
from db.conexion_db import get_db

router = APIRouter(prefix="/candidatos", tags=["Candidatos"])


@router.post("", response_model=CandidatoResponse)
def crear_candidato(candidato: CandidatoCreate, db: Session = Depends(get_db)):
    nuevo_candidato = Candidato(**candidato.model_dump())
    db.add(nuevo_candidato)
    db.commit()
    db.refresh(nuevo_candidato)
    return nuevo_candidato


@router.get("", response_model=List[CandidatoResponse])
def listar_candidatos(db: Session = Depends(get_db)):
    return db.query(Candidato).all()


@router.get("/{candidato_id}", response_model=CandidatoResponse)
def obtener_candidato(candidato_id: int, db: Session = Depends(get_db)):
    candidato = db.query(Candidato).get(candidato_id)
    if not candidato:
        raise HTTPException(status_code=404, detail="Candidato no encontrado")
    return candidato