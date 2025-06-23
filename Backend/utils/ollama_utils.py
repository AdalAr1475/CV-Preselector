import requests
import json

ollama_base_url = "http://localhost:11434"
deepseek_model_name = "deepseek-r1:8b" # O deepseek-v2, etc., según el que tengas descargado

# --- Helper function para hacer las peticiones de chat ---
def call_ollama_chat_api(messages, model=deepseek_model_name, format=None, stream=False):
    """
    Realiza una petición a la API de chat de Ollama.
    """
    headers = {'Content-Type': 'application/json'}
    payload = {
        "model": model,
        "messages": messages,
        "stream": stream
    }
    if format:
        payload["format"] = format

    try:
        response = requests.post(f"{ollama_base_url}/api/chat", headers=headers, json=payload)
        response.raise_for_status() # Lanza una excepción para errores HTTP
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con Ollama o en la petición: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Detalles del error: {e.response.text}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error al parsear el JSON de la respuesta de Ollama: {e}")
        print(f"Respuesta cruda: {response.text}") # Imprimir la respuesta cruda para depuración
        return None

# --- Helper function para hacer las peticiones de embeddings ---
def call_ollama_embeddings_api(prompt_text, model="nomic-embed-text"):
    """
    Realiza una petición a la API de embeddings de Ollama.
    """
    headers = {'Content-Type': 'application/json'}
    payload = {
        "model": model,
        "prompt": prompt_text
    }
    try:
        response = requests.post(f"{ollama_base_url}/api/embeddings", headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error al conectar con Ollama o en la petición de embeddings: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Detalles del error: {e.response.text}")
        return None

# --- DATOS DE EJEMPLO ---
cv_text = """
Juan Pérez
juan.perez@email.com
+51 987 654 321

Resumen:
Ingeniero de Software con 5 años de experiencia en desarrollo web full-stack, especializado en Python, Django y React. Apasionado por la creación de soluciones escalables y eficientes.

Experiencia Laboral:
1. Desarrollador Full-Stack, TechSolutions S.A. (Enero 2022 - Presente)
   - Lideré el desarrollo de la nueva plataforma e-commerce utilizando Django REST Framework y React.
   - Implementé microservicios con Docker y Kubernetes.
   - Reduje el tiempo de carga de la página en un 30% mediante optimización de consultas a la base de datos.

2. Desarrollador Web Junior, InnovaSoft (Julio 2019 - Diciembre 2021)
   - Desarrollé y mantuve aplicaciones web con Flask y jQuery.
   - Colaboré en el diseño de bases de datos relacionales (PostgreSQL).

Educación:
- Ingeniería de Software, Universidad Nacional de Ingeniería (2015 - 2019)

Habilidades:
- Lenguajes: Python, JavaScript, SQL, HTML, CSS
- Frameworks/Librerías: Django, Flask, React, Node.js, jQuery, FastAPI
- Bases de Datos: PostgreSQL, MongoDB, MySQL
- Herramientas: Docker, Kubernetes, Git, AWS, Jira, Trello
- Otros: Metodologías Ágiles, APIs RESTful, Test Driven Development (TDD)
"""

cv_resumen = """
Ingeniero de Software con 5 años de experiencia en desarrollo web full-stack,
especializado en Python, Django y React. Implementación de microservicios con Docker y Kubernetes.
Redujo el tiempo de carga de la página en un 30%.
"""

job_description = """
Estamos buscando un Desarrollador Full-Stack Senior con al menos 4 años de experiencia.
Debe tener sólidos conocimientos en Python, Django, microservicios, Docker, Kubernetes y React.
Se valorará la experiencia en optimización de rendimiento y bases de datos NoSQL.
"""

question_asked = "¿Puedes describir un proyecto en el que hayas implementado microservicios con Docker y Kubernetes? ¿Qué desafíos enfrentaste y cómo los resolviste?"

candidate_answer = """
Claro. En mi puesto anterior en TechSolutions, lideré el desarrollo de una nueva plataforma e-commerce.
Utilizamos Docker para contenerizar cada servicio (autenticación, productos, pagos) y Kubernetes
para orquestar el despliegue y escalar los servicios. Un desafío fue la gestión de logs distribuidos,
que resolvimos implementando un stack ELK (Elasticsearch, Logstash, Kibana) centralizado.
Otro desafío fue la comunicación entre servicios, que manejamos con un API Gateway y RabbitMQ para mensajería asíncrona.
"""

print("--- Extracción y Normalización de Datos de CVs ---")
extract_cv_messages = [
    {"role": "system", "content": "Eres un asistente útil especializado en extraer información estructurada de CVs en formato JSON. Responde solo con el objeto JSON."},
{
    "role": "user",
    "content": f"""
Extrae la siguiente información del CV proporcionado y devuélvela en formato JSON.
Asegúrate de que el JSON sea válido y contenga los siguientes campos:
- "nombre_completo": Nombre y apellidos del candidato.
- "email": Dirección de correo electrónico.
- "telefono": Número de teléfono.
- "resumen": Breve descripción del perfil del candidato.
- "experiencia_laboral": Una lista de objetos, cada uno con "puesto", "empresa", "periodo", "descripcion".
- "educacion": Una lista de objetos, cada uno con "titulo", "institucion", "periodo".
- "habilidades": Una lista de strings.

Si algún campo no se encuentra, omítelo o déjalo como un array vacío o string vacío según corresponda.

CV:
{cv_text}
"""
}
]

response_data = call_ollama_chat_api(extract_cv_messages, format="json")
if response_data:
    try:
        extracted_json_str = response_data['message']['content']
        extracted_data = json.loads(extracted_json_str)
        print(json.dumps(extracted_data, indent=2, ensure_ascii=False))
    except json.JSONDecodeError as e:
        print(f"Error al parsear el JSON de CV: {e}")
        print(f"Contenido recibido: {extracted_json_str}")
else:
    print("No se pudo extraer el CV.")


print("\n--- Generación de Embeddings para Matching Semántico ---")
# Para embeddings, seguimos usando un modelo específico de embeddings, no DeepSeek
embedding_model = "nomic-embed-text" # Asegúrate de tenerlo descargado: ollama pull nomic-embed-text

embedding_cv = call_ollama_embeddings_api(cv_resumen, model=embedding_model)
embedding_job = call_ollama_embeddings_api(job_description, model=embedding_model)

if embedding_cv and embedding_job:
    from sklearn.metrics.pairwise import cosine_similarity
    import numpy as np

    vec_cv = np.array(embedding_cv['embedding']).reshape(1, -1)
    vec_job = np.array(embedding_job['embedding']).reshape(1, -1)

    similarity = cosine_similarity(vec_cv, vec_job)
    print(f"Similitud coseno entre CV y descripción del puesto: {similarity[0][0]:.4f}")
else:
    print("No se pudieron generar los embeddings.")


print("\n--- Generación de Preguntas para Preentrevistas Automáticas ---")
generate_questions_messages = [
    {"role": "system", "content": "Eres un asistente de selección de personal experto en formular preguntas de entrevista desafiantes y personalizadas."},
    {"role": "user", "content": f"""
Genera 5 preguntas de entrevista para un candidato, basándote en su resumen de CV y la descripción del puesto.
Las preguntas deben ser desafiantes y explorar su experiencia en las tecnologías mencionadas.
Asegúrate de que sean preguntas abiertas para fomentar respuestas detalladas.
Devuelve las preguntas en una lista numerada.

Resumen del CV del Candidato:
{cv_resumen}

Descripción del Puesto:
{job_description}
"""}
]

response_data = call_ollama_chat_api(generate_questions_messages)
if response_data:
    print("Preguntas generadas:")
    print(response_data['message']['content'])
else:
    print("No se pudieron generar las preguntas.")


print("\n--- Análisis y Evaluación de Respuestas de Preentrevistas ---")
evaluate_answer_messages = [
    {"role": "system", "content": "Eres un evaluador de entrevistas que analiza respuestas y proporciona feedback estructurado en JSON."},
    {
        "role": "user",
        "content": f"""
Evalúa la siguiente respuesta de un candidato a una pregunta de entrevista.
Califica la respuesta en una escala del 1 al 5 (1=Mala, 5=Excelente) en términos de:
- Relevancia
- Profundidad técnica
- Claridad de la explicación
- Identificación de desafíos y soluciones

Luego, proporciona un breve comentario sobre la respuesta y sugiere una posible pregunta de seguimiento.

Pregunta: {question_asked}
Respuesta del Candidato: {candidate_answer}

Formato de salida (JSON):
{{
  "calificacion_relevancia": int,
  "calificacion_profundidad_tecnica": int,
  "calificacion_claridad": int,
  "calificacion_desafios_soluciones": int,
  "comentario": string,
  "pregunta_seguimiento": string
}}
"""
    }
]

response_data = call_ollama_chat_api(evaluate_answer_messages, format="json")
if response_data:
    try:
        evaluation_json_str = response_data['message']['content']
        evaluation_data = json.loads(evaluation_json_str)
        print(json.dumps(evaluation_data, indent=2, ensure_ascii=False))
    except json.JSONDecodeError as e:
        print(f"Error al parsear el JSON de evaluación: {e}")
        print(f"Contenido recibido: {evaluation_json_str}")
else:
    print("No se pudo evaluar la respuesta.")