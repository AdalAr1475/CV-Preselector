from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentoResponse(BaseModel):
    id: int
    candidato_id: int
    nombre_archivo: Optional[str]
    ruta_archivo: Optional[str]
    texto_extraido: Optional[str]
    creado_en: datetime

    class Config:
        orm_mode = True
