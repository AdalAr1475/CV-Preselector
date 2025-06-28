-- EMPRESAS
INSERT INTO empresa (nombre, ruc, descripcion) VALUES
('TechCorp Solutions', '20481234567', 'Empresa de tecnología especializada en soluciones empresariales.'),
('InnovaDigital', '20399887766', 'Consultora en transformación digital y desarrollo de software.');

-- OFERTAS LABORALES
INSERT INTO oferta_laboral (empresa_id, titulo, descripcion, requisitos, ubicacion) VALUES
(1, 'Desarrollador Full Stack', 'Trabajo en equipo con proyectos modernos.', 'React, Node.js, PostgreSQL', 'Lima'),
(2, 'Analista de Datos', 'Análisis de datos y visualización.', 'Python, SQL, Power BI', 'Arequipa');

-- CANDIDATOS
INSERT INTO candidato (nombre_completo, correo, telefono, linkedin) VALUES
('Juan Pérez', 'juan.perez@gmail.com', '999123456', 'https://linkedin.com/in/juanperez'),
('Lucía Gómez', 'lucia.gomez@gmail.com', '988654321', 'https://linkedin.com/in/luciagomez');

-- DOCUMENTOS DE CV
INSERT INTO cv_documento (candidato_id, nombre_archivo, ruta_archivo, texto_extraido) VALUES
(1, 'juan_cv.pdf', 'uploads/juan_cv.pdf', 'Experiencia en React, Node, manejo de APIs y PostgreSQL.'),
(2, 'lucia_cv.pdf', 'uploads/lucia_cv.pdf', 'Experiencia en análisis de datos, Python, pandas y dashboards.');

-- POSTULACIONES
INSERT INTO postulacion (candidato_id, oferta_id) VALUES
(1, 1),
(2, 2);

-- EMBEDDINGS
INSERT INTO cv_embedding (candidato_id, embedding, modelo) VALUES
(1, '[0.234, 0.678, 0.543, 0.111]', 'openai-embedding-ada'),
(2, '[0.876, 0.432, 0.654, 0.321]', 'openai-embedding-ada');

-- RANKINGS
INSERT INTO ranking_postulacion (postulacion_id, score, score_semantico, observaciones) VALUES
(1, 92.5, 0.8243, 'Perfil altamente compatible con el rol.'),
(2, 88.0, 0.7521, 'Fuerte dominio técnico pero menor experiencia.');

-- PRE-ENTREVISTAS
INSERT INTO preentrevista (postulacion_id, resumen, puntuacion) VALUES
(1, 'Juan mostró seguridad y dominio técnico. Fue claro al explicar sus proyectos.', 9.2),
(2, 'Lucía explicó bien su experiencia con Power BI y proyectos académicos.', 8.8);

-- PREGUNTAS DE PREENTREVISTA
INSERT INTO preentrevista_pregunta (preentrevista_id, pregunta, respuesta, feedback) VALUES
(1, '¿Qué es React y cómo lo has usado?', 'React es una librería para construir interfaces. Lo usé en un dashboard financiero.', 'Respuesta clara y completa.'),
(1, '¿Cómo manejas el control de versiones?', 'Uso Git y GitHub. Trabajo con ramas por feature.', 'Buena práctica.'),
(2, '¿Qué herramientas usaste para visualización de datos?', 'He usado Power BI y Tableau.', 'Demostró conocimiento sólido.');
