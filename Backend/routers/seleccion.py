from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from db.models import RankingPostulacion
from db.conexion_db import get_db
from schemas.seleccion import SeleccionResponse

router = APIRouter(prefix="/seleccion", tags=["Selección"])

@router.get("/ranking/{postulacion_id}", response_model=SeleccionResponse)
def obtener_ranking(postulacion_id: int, db: Session = Depends(get_db)):
    ranking = db.query(RankingPostulacion).filter_by(postulacion_id=postulacion_id).first()
    if not ranking:
        raise HTTPException(status_code=404, detail="Ranking no encontrado para esta postulación")
    
    return ranking
