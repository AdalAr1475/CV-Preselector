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

app.include_router(auth.router)
app.include_router(empresa.router)
app.include_router(ofertas.router)
app.include_router(candidatos.router)
app.include_router(documentos.router)
app.include_router(procesamiento.router)
app.include_router(seleccion.router)

