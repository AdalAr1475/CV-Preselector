from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.models import OfertaLaboral
from schemas.oferta import OfertaCreate, OfertaResponse
from db.conexion_db import get_db

router = APIRouter(prefix="/ofertas", tags=["Ofertas Laborales"])


@router.post("/", response_model=OfertaResponse)
def crear_oferta(oferta: OfertaCreate, db: Session = Depends(get_db)):
    nueva_oferta = OfertaLaboral(**oferta.model_dump())
    db.add(nueva_oferta)
    db.commit()
    db.refresh(nueva_oferta)
    return nueva_oferta


@router.get("/", response_model=List[OfertaResponse])
def listar_ofertas(db: Session = Depends(get_db)):
    return db.query(OfertaLaboral).all()


@router.get("/{oferta_id}", response_model=OfertaResponse)
def obtener_oferta(oferta_id: int, db: Session = Depends(get_db)):
    oferta = db.query(OfertaLaboral).get(oferta_id)
    if not oferta:
        raise HTTPException(status_code=404, detail="Oferta no encontrada")
    return oferta
