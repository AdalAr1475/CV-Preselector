from pydantic import BaseModel
from typing import Optional

class SeleccionResponse(BaseModel):
    score: Optional[float]
    score_semantico: Optional[float]
    observaciones: Optional[str]

    class Config:
        orm_mode = True
