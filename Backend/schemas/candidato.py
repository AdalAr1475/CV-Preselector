from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class CandidatoBase(BaseModel):
    nombre_completo: Optional[str] = Field(None, example="Ana Pérez")
    correo: Optional[EmailStr] = Field(None, example="ana@example.com")
    telefono: Optional[str] = Field(None, example="+51 987654321")
    linkedin: Optional[str] = Field(None, example="https://linkedin.com/in/anaperez")


class CandidatoCreate(CandidatoBase):
    pass


class CandidatoResponse(CandidatoBase):
    id: int
    creado_en: datetime

    class Config:
        orm_mode = True
