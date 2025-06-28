# 🚀 Casos de Uso - Router de Procesamiento con IA

## 📋 Endpoints Disponibles

### 1. **POST /procesamiento/extraer-cv**
Extrae datos estructurados de un CV en texto plano.

**Caso de uso:** Procesar CVs enviados por correo o copiados manualmente.

**Request:**
```json
{
  "texto_cv": "Juan Pérez\njuan@email.com\n+51 987654321\n\nExperiencia:\n- Desarrollador Python 3 años..."
}
```

**Response:**
```json
{
  "nombre_completo": "Juan Pérez",
  "email": "juan@email.com",
  "telefono": "+51 987654321",
  "resumen": "Desarrollador con 3 años de experiencia",
  "experiencia_laboral": [
    {
      "puesto": "Desarrollador Python",
      "empresa": "TechCorp",
      "periodo": "2021-2024",
      "descripcion": "Desarrollo de APIs"
    }
  ],
  "educacion": [],
  "habilidades": ["Python", "FastAPI", "PostgreSQL"]
}
```

---

### 2. **POST /procesamiento/similitud**
Calcula la similitud semántica entre CV y descripción del puesto.

**Caso de uso:** Ranking automático de candidatos.

**Request:**
```json
{
  "cv_resumen": "Desarrollador Python con 3 años de experiencia en APIs REST",
  "job_description": "Buscamos desarrollador Python con experiencia en FastAPI y bases de datos"
}
```

**Response:**
```json
{
  "similitud": 0.8547,
  "porcentaje": 85.47,
  "nivel": "Excelente"
}
```

---

### 3. **POST /procesamiento/generar-preguntas**
Genera preguntas de entrevista personalizadas.

**Caso de uso:** Preparar entrevistas técnicas automáticamente.

**Request:**
```json
{
  "cv_resumen": "Desarrollador Full-Stack con Docker y Kubernetes",
  "job_description": "Senior Developer con microservicios"
}
```

**Response:**
```json
{
  "status": "success",
  "preguntas": "1. ¿Puedes describir tu experiencia con Docker en producción?\n2. ¿Cómo manejas la comunicación entre microservicios?\n3. ¿Qué estrategias usas para el monitoreo distribuido?",
  "cv_resumen": "...",
  "job_description": "..."
}
```

---

### 4. **POST /procesamiento/evaluar-respuesta**
Evalúa respuestas de candidatos en entrevistas.

**Caso de uso:** Scoring automático de entrevistas técnicas.

**Request:**
```json
{
  "pregunta": "¿Cómo implementarías un sistema de cache distribuido?",
  "respuesta_candidato": "Usaría Redis Cluster con particionamiento consistente y replicación para alta disponibilidad..."
}
```

**Response:**
```json
{
  "status": "success",
  "evaluacion": {
    "calificacion_relevancia": 5,
    "calificacion_profundidad_tecnica": 4,
    "calificacion_claridad": 4,
    "calificacion_desafios_soluciones": 5,
    "comentario": "Excelente respuesta técnica con soluciones específicas",
    "pregunta_seguimiento": "¿Cómo manejarías la invalidación de cache?"
  }
}
```

---

### 5. **POST /procesamiento/analisis-completo/{candidato_id}/{oferta_id}**
Proceso completo de análisis de CV (subir PDF + análisis completo).

**Caso de uso:** Proceso end-to-end desde PDF hasta ranking final.

**Request:** Multipart form con archivo PDF

**Response:**
```json
{
  "status": "success",
  "message": "Análisis completo realizado exitosamente",
  "candidato_id": 1,
  "oferta_id": 2,
  "archivo_guardado": "uploads/abc123.pdf",
  "datos_extraidos": { /* datos estructurados */ },
  "similitud": {
    "score": 0.8547,
    "porcentaje": 85.47,
    "nivel": "Excelente"
  },
  "preguntas_generadas": "1. Pregunta técnica...",
  "postulacion_id": 15
}
```

---

### 6. **POST /procesamiento/calificar** (Original mejorado)
Endpoint original con mejoras de logging y manejo de errores.

---

## 🎯 Casos de Uso Completos

### **Caso 1: Proceso de Selección Automatizado**

**Flujo:**
1. **RH recibe CV por email** → Copia texto y usa `/extraer-cv`
2. **Sistema extrae datos** → Crea candidato automáticamente
3. **Calcula similitud** → Usa `/similitud` con ofertas activas
4. **Genera ranking** → Ordena candidatos por score
5. **Prepara entrevistas** → Usa `/generar-preguntas`

**Código de ejemplo:**
```python
# 1. Extraer datos del CV
cv_data = await extraer_datos_cv({"texto_cv": cv_text})

# 2. Crear candidato
candidato = await crear_candidato({
    "nombre_completo": cv_data.nombre_completo,
    "correo": cv_data.email
})

# 3. Calcular similitud con ofertas
for oferta in ofertas_activas:
    similitud = await calcular_similitud({
        "cv_resumen": cv_text[:500],
        "job_description": oferta.descripcion
    })
    # Guardar ranking

# 4. Generar preguntas para mejor match
preguntas = await generar_preguntas_entrevista({
    "cv_resumen": cv_text[:500],
    "job_description": mejor_oferta.descripcion
})
```

### **Caso 2: Entrevista Técnica Asistida**

**Flujo:**
1. **Candidato llega a entrevista** → Sistema tiene preguntas preparadas
2. **Entrevistador hace preguntas** → Candidato responde
3. **Evalúa en tiempo real** → Usa `/evaluar-respuesta`
4. **Genera preguntas de seguimiento** → Basado en evaluación
5. **Score final automático** → Combinando todas las evaluaciones

### **Caso 3: Procesamiento Masivo de CVs**

**Flujo:**
1. **Empresa recibe 100 CVs** → Batch processing
2. **Por cada PDF** → Usa `/analisis-completo`
3. **Sistema procesa automáticamente** → Extrae, califica, rankea
4. **RH recibe lista ordenada** → Por score de similitud
5. **Entrevistas priorizadas** → Solo top 10 candidatos

### **Caso 4: Mejora Continua del Sistema**

**Flujo:**
1. **Analiza correlaciones** → Scores vs contrataciones exitosas
2. **Ajusta algoritmos** → Basado en feedback histórico
3. **Valida preguntas** → Efectividad en predicción
4. **Optimiza prompts** → Para mejor extracción de datos

---

## 🔧 Configuración y Pruebas

### **Variables de Entorno Necesarias:**
```env
OLLAMA_BASE_URL=http://localhost:11434
DEEPSEEK_MODEL=deepseek-r1:8b
EMBEDDING_MODEL=nomic-embed-text
```

### **Modelos de IA Requeridos:**
```bash
# Instalar modelos en Ollama
ollama pull deepseek-r1:8b
ollama pull nomic-embed-text
```

### **Pruebas con cURL:**

```bash
# Extraer CV
curl -X POST "http://localhost:8000/procesamiento/extraer-cv" \
  -H "Content-Type: application/json" \
  -d '{"texto_cv": "Juan Pérez\njuan@email.com\nDesarrollador Python"}'

# Calcular similitud
curl -X POST "http://localhost:8000/procesamiento/similitud" \
  -H "Content-Type: application/json" \
  -d '{"cv_resumen": "Python developer", "job_description": "Python engineer needed"}'

# Análisis completo
curl -X POST "http://localhost:8000/procesamiento/analisis-completo/1/2" \
  -F "file=@cv.pdf"
```

---

## 📊 Beneficios del Sistema

- **⚡ Automatización completa** del proceso de selección
- **🎯 Ranking objetivo** basado en similitud semántica
- **🤖 Entrevistas asistidas** con preguntas personalizadas
- **📈 Escalabilidad** para procesar miles de CVs
- **🔄 Mejora continua** con feedback y aprendizaje
- **💾 Trazabilidad completa** de decisiones y scores

---

## 🚨 Características de Resiliencia

- **Fallback simulado** cuando Ollama no está disponible
- **Logging detallado** para debugging
- **Manejo robusto de errores** con rollback de BD
- **Validación de datos** en todos los endpoints
- **Códigos de estado HTTP apropiados**
