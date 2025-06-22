from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class EmpresaBase(BaseModel):
    nombre: str
    ruc: Optional[str] = None
    descripcion: Optional[str] = None


class EmpresaCreate(EmpresaBase):
    pass


class EmpresaResponse(EmpresaBase):
    id: int
    creado_en: datetime

    class Config:
        orm_mode = True
