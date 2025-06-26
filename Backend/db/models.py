from datetime import datetime, date
from typing import List, Optional

from sqlalchemy import (
    ForeignKey,
    String,
    Text,
    Integer,
    DateTime,
    Date,
    Float,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass


class Empresa(Base):
    __tablename__ = "empresa"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(255))
    ruc: Mapped[Optional[str]] = mapped_column(String(20))
    descripcion: Mapped[Optional[str]] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    ofertas: Mapped[List["OfertaLaboral"]] = relationship("OfertaLaboral", back_populates="empresa")


class OfertaLaboral(Base):
    __tablename__ = "oferta_laboral"

    id: Mapped[int] = mapped_column(primary_key=True)
    empresa_id: Mapped[int] = mapped_column(ForeignKey("empresa.id"))
    titulo: Mapped[str] = mapped_column(String(255))
    descripcion: Mapped[Optional[str]] = mapped_column(Text)
    requisitos: Mapped[Optional[str]] = mapped_column(Text)
    ubicacion: Mapped[Optional[str]] = mapped_column(String(255))
    fecha_publicacion: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    estado: Mapped[str] = mapped_column(String(50), default="activa")

    empresa: Mapped["Empresa"] = relationship(back_populates="ofertas")
    postulaciones: Mapped[List["Postulacion"]] = relationship("Postulacion", back_populates="oferta")


class Candidato(Base):
    __tablename__ = "candidato"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre_completo: Mapped[Optional[str]] = mapped_column(String(255))
    correo: Mapped[Optional[str]] = mapped_column(String(255))
    telefono: Mapped[Optional[str]] = mapped_column(String(50))
    linkedin: Mapped[Optional[str]] = mapped_column(String(255))
    creado_en: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    cv_documentos: Mapped[List["CVDocumento"]] = relationship("CVDocumento", back_populates="candidato")
    experiencias: Mapped[List["CVExperiencia"]] = relationship("CVExperiencia", back_populates="candidato")
    educaciones: Mapped[List["CVEducacion"]] = relationship("CVEducacion", back_populates="candidato")
    postulaciones: Mapped[List["Postulacion"]] = relationship("Postulacion", back_populates="candidato")
    embedding: Mapped[Optional["CVEmbedding"]] = relationship("CVEmbedding", back_populates="candidato", uselist=False)


class CVDocumento(Base):
    __tablename__ = "cv_documento"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidato_id: Mapped[int] = mapped_column(ForeignKey("candidato.id"))
    nombre_archivo: Mapped[Optional[str]] = mapped_column(String(255))
    ruta_archivo: Mapped[Optional[str]] = mapped_column(Text)
    texto_extraido: Mapped[Optional[str]] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    candidato: Mapped["Candidato"] = relationship(back_populates="cv_documentos")


class CVExperiencia(Base):
    __tablename__ = "cv_experiencia"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidato_id: Mapped[int] = mapped_column(ForeignKey("candidato.id"))
    empresa: Mapped[Optional[str]] = mapped_column(String(255))
    cargo: Mapped[Optional[str]] = mapped_column(String(255))
    descripcion: Mapped[Optional[str]] = mapped_column(Text)
    fecha_inicio: Mapped[Optional[date]]
    fecha_fin: Mapped[Optional[date]]

    candidato: Mapped["Candidato"] = relationship(back_populates="experiencias")


class CVEducacion(Base):
    __tablename__ = "cv_educacion"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidato_id: Mapped[int] = mapped_column(ForeignKey("candidato.id"))
    institucion: Mapped[Optional[str]] = mapped_column(String(255))
    grado: Mapped[Optional[str]] = mapped_column(String(255))
    carrera: Mapped[Optional[str]] = mapped_column(String(255))
    fecha_inicio: Mapped[Optional[date]]
    fecha_fin: Mapped[Optional[date]]

    candidato: Mapped["Candidato"] = relationship(back_populates="educaciones")


class Postulacion(Base):
    __tablename__ = "postulacion"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidato_id: Mapped[int] = mapped_column(ForeignKey("candidato.id"))
    oferta_id: Mapped[int] = mapped_column(ForeignKey("oferta_laboral.id"))
    fecha_postulacion: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    candidato: Mapped["Candidato"] = relationship(back_populates="postulaciones")
    oferta: Mapped["OfertaLaboral"] = relationship(back_populates="postulaciones")
    ranking: Mapped[Optional["RankingPostulacion"]] = relationship("RankingPostulacion", back_populates="postulacion", uselist=False)
    preentrevistas: Mapped[List["PreEntrevista"]] = relationship("PreEntrevista", back_populates="postulacion")


class CVEmbedding(Base):
    __tablename__ = "cv_embedding"

    id: Mapped[int] = mapped_column(primary_key=True)
    candidato_id: Mapped[int] = mapped_column(ForeignKey("candidato.id"), unique=True)
    embedding: Mapped[Optional[str]] = mapped_column(Text) # Almacenar como JSON serializado
    modelo: Mapped[Optional[str]] = mapped_column(String(100))
    fecha_generacion: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    candidato: Mapped["Candidato"] = relationship(back_populates="embedding")


class RankingPostulacion(Base):
    __tablename__ = "ranking_postulacion"

    id: Mapped[int] = mapped_column(primary_key=True)
    postulacion_id: Mapped[int] = mapped_column(ForeignKey("postulacion.id"), unique=True)
    score: Mapped[Optional[float]]  # Ej: 92.5
    score_semantico: Mapped[Optional[float]]  # Ej: 0.8234
    observaciones: Mapped[Optional[str]] = mapped_column(Text)

    postulacion: Mapped["Postulacion"] = relationship(back_populates="ranking")


class PreEntrevista(Base):
    __tablename__ = "preentrevista"

    id: Mapped[int] = mapped_column(primary_key=True)
    postulacion_id: Mapped[int] = mapped_column(ForeignKey("postulacion.id"))
    fecha: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    resumen: Mapped[Optional[str]] = mapped_column(Text)
    puntuacion: Mapped[Optional[float]]

    postulacion: Mapped["Postulacion"] = relationship(back_populates="preentrevistas")
    preguntas: Mapped[List["PreEntrevistaPregunta"]] = relationship("PreEntrevistaPregunta", back_populates="preentrevista")


class PreEntrevistaPregunta(Base):
    __tablename__ = "preentrevista_pregunta"

    id: Mapped[int] = mapped_column(primary_key=True)
    preentrevista_id: Mapped[int] = mapped_column(ForeignKey("preentrevista.id"))
    pregunta: Mapped[Optional[str]] = mapped_column(Text)
    respuesta: Mapped[Optional[str]] = mapped_column(Text)
    feedback: Mapped[Optional[str]] = mapped_column(Text)

    preentrevista: Mapped["PreEntrevista"] = relationship(back_populates="preguntas")
