-- Eliminación en orden correcto
DROP TABLE IF EXISTS preentrevista_pregunta CASCADE;
DROP TABLE IF EXISTS preentrevista CASCADE;
DROP TABLE IF EXISTS ranking_postulacion CASCADE;
DROP TABLE IF EXISTS cv_embedding CASCADE;
DROP TABLE IF EXISTS postulacion CASCADE;
DROP TABLE IF EXISTS cv_educacion CASCADE;
DROP TABLE IF EXISTS cv_experiencia CASCADE;
DROP TABLE IF EXISTS cv_documento CASCADE;
DROP TABLE IF EXISTS candidato CASCADE;
DROP TABLE IF EXISTS oferta_laboral CASCADE;
DROP TABLE IF EXISTS empresa CASCADE;

-- Tabla: empresa
CREATE TABLE empresa (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    ruc VARCHAR(20),
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: oferta_laboral
CREATE TABLE oferta_laboral (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresa(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    requisitos TEXT,
    ubicacion VARCHAR(255),
    fecha_publicacion TIMESTAMP DEFAULT NOW(),
    estado VARCHAR(50) DEFAULT 'activa'
);

-- Tabla: candidato
CREATE TABLE candidato (
    id SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(255),
    correo VARCHAR(255),
    telefono VARCHAR(50),
    linkedin VARCHAR(255),
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: cv_documento
CREATE TABLE cv_documento (
    id SERIAL PRIMARY KEY,
    candidato_id INTEGER REFERENCES candidato(id),
    nombre_archivo VARCHAR(255),
    ruta_archivo TEXT,
    texto_extraido TEXT,
    creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: cv_experiencia
CREATE TABLE cv_experiencia (
    id SERIAL PRIMARY KEY,
    candidato_id INTEGER REFERENCES candidato(id),
    empresa VARCHAR(255),
    cargo VARCHAR(255),
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE
);

-- Tabla: cv_educacion
CREATE TABLE cv_educacion (
    id SERIAL PRIMARY KEY,
    candidato_id INTEGER REFERENCES candidato(id),
    institucion VARCHAR(255),
    grado VARCHAR(255),
    carrera VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE
);

-- Tabla: postulacion
CREATE TABLE postulacion (
    id SERIAL PRIMARY KEY,
    candidato_id INTEGER REFERENCES candidato(id),
    oferta_id INTEGER REFERENCES oferta_laboral(id),
    fecha_postulacion TIMESTAMP DEFAULT NOW()
);

-- Tabla: cv_embedding (con pgvector)
-- Consideramos 768 dimensiones como las usadas por 'all-MiniLM-L6-v2'
CREATE TABLE cv_embedding (
    id SERIAL PRIMARY KEY,
    candidato_id INTEGER REFERENCES candidato(id),
    embedding vector(768),
    modelo VARCHAR(100),
    fecha_generacion TIMESTAMP DEFAULT NOW()
);

-- Tabla: ranking_postulacion
CREATE TABLE ranking_postulacion (
    id SERIAL PRIMARY KEY,
    postulacion_id INTEGER REFERENCES postulacion(id),
    score NUMERIC(5, 2),               -- score general
    score_semantico NUMERIC(5, 4),     -- score de similitud semántica (ej. 0.8765)
    observaciones TEXT
);

-- Tabla: preentrevista
CREATE TABLE preentrevista (
    id SERIAL PRIMARY KEY,
    postulacion_id INTEGER REFERENCES postulacion(id),
    fecha TIMESTAMP DEFAULT NOW(),
    resumen TEXT,
    puntuacion NUMERIC(5, 2)
);

-- Tabla: preentrevista_pregunta
CREATE TABLE preentrevista_pregunta (
    id SERIAL PRIMARY KEY,
    preentrevista_id INTEGER REFERENCES preentrevista(id),
    pregunta TEXT,
    respuesta TEXT,
    feedback TEXT
);
