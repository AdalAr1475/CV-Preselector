from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from db.models import Empresa
from schemas.empresa import EmpresaCreate, EmpresaResponse
from db.conexion_db import get_db

router = APIRouter(prefix="/empresas", tags=["Empresas"])


@router.post("", response_model=EmpresaResponse)
def crear_empresa(empresa: EmpresaCreate, db: Session = Depends(get_db)):
    nueva_empresa = Empresa(**empresa.model_dump())
    db.add(nueva_empresa)
    db.commit()
    db.refresh(nueva_empresa)
    return nueva_empresa


@router.get("", response_model=List[EmpresaResponse])
def listar_empresas(db: Session = Depends(get_db)):
    return db.query(Empresa).all()


@router.get("/{empresa_id}", response_model=EmpresaResponse)
def obtener_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).get(empresa_id)
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa
