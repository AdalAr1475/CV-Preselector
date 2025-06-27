from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class OfertaBase(BaseModel):
    empresa_id: int
    titulo: str = Field(..., example="Desarrollador Backend")
    descripcion: Optional[str] = Field(None, example="Buscamos un backend con experiencia en Python")
    requisitos: Optional[str] = Field(None, example="Conocimientos en FastAPI y PostgreSQL")
    ubicacion: Optional[str] = Field(None, example="Remoto")
    estado: Optional[str] = Field("activa", example="activa")


class OfertaCreate(OfertaBase):
    pass


class OfertaResponse(OfertaBase):
    id: int
    fecha_publicacion: datetime

    class Config:
        orm_mode = True
