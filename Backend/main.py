from fastapi import FastAPI
from routers import (
    auth, candidatos, documentos, empresa, ofertas, procesamiento, seleccion              
)
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://192.168.18.26:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router,  prefix="/auth")
app.include_router(empresa.router, prefix="/empresa")
app.include_router(ofertas.router, prefix="/ofertas")
app.include_router(candidatos.router, prefix="/candidatos")
app.include_router(documentos.router, prefix="/documentos")
app.include_router(procesamiento.router, prefix="/procesamiento")
app.include_router(seleccion.router, prefix="/seleccion")

