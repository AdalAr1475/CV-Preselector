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

def call_ollama_comparation(cv_resumen, job_description, embedding_model="nomic-embed-text"):
    """
    Genera embeddings para el CV y la descripción del puesto y calcula la similitud coseno.
    """
    cv_embedding = call_ollama_embeddings_api(cv_resumen, model=embedding_model)
    job_embedding = call_ollama_embeddings_api(job_description, model=embedding_model)

    if cv_embedding and job_embedding:
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np

        vec_cv = np.array(cv_embedding['embedding']).reshape(1, -1)
        vec_job = np.array(job_embedding['embedding']).reshape(1, -1)

        similarity = cosine_similarity(vec_cv, vec_job)
        return similarity[0][0]
    else:
        return None

# --- DATOS DE EJEMPLO ---
# Ejemplo de CV en texto plano
"""
cv_text = '''
Juan Pérez
juan.perez@email.com
+51 987 654 321

Resumen:
Ingeniero de Software con 5 años de experiencia en desarrollo web full-stack, especializado en Python, Django y React.

Experiencia Laboral:
1. Desarrollador Full-Stack, TechSolutions S.A. (Enero 2022 - Presente)
   - Lideré el desarrollo de la nueva plataforma e-commerce utilizando Django REST Framework y React.
   - Implementé microservicios con Docker y Kubernetes.

2. Desarrollador Web Junior, InnovaSoft (Julio 2019 - Diciembre 2021)
   - Desarrollé y mantuve aplicaciones web con Flask y jQuery.

Educación:
- Ingeniería de Software, Universidad Nacional de Ingeniería (2015 - 2019)

Habilidades:
- Lenguajes: Python, JavaScript, SQL, HTML, CSS
- Frameworks/Librerías: Django, Flask, React, Node.js, jQuery, FastAPI
- Bases de Datos: PostgreSQL, MongoDB, MySQL
- Herramientas: Docker, Kubernetes, Git, AWS, Jira, Trello
'''

cv_resumen = '''
Ingeniero de Software con 5 años de experiencia en desarrollo web full-stack,
especializado en Python, Django y React. Implementación de microservicios con Docker y Kubernetes.
'''

job_description = '''
Estamos buscando un Desarrollador Full-Stack Senior con al menos 4 años de experiencia.
Debe tener sólidos conocimientos en Python, Django, microservicios, Docker, Kubernetes y React.
'''

question_asked = '¿Puedes describir un proyecto en el que hayas implementado microservicios con Docker y Kubernetes?'

candidate_answer = '''
En mi puesto anterior en TechSolutions, lideré el desarrollo de una nueva plataforma e-commerce.
Utilizamos Docker para contenerizar cada servicio y Kubernetes para orquestar el despliegue.
'''
"""

# --- FUNCIONES DE EJEMPLO CON RESULTADOS SIMULADOS ---

def extract_cv_data_example(extracted_data):
    """
    Ejemplo de extracción de datos de CV.
    Retorna un resultado simulado en formato JSON.
    """
    print("--- Extracción y Normalización de Datos de CVs ---")
    
    print(json.dumps(extracted_data, indent=2, ensure_ascii=False))
    return extracted_data


def calculate_similarity_example():
    """
    Ejemplo de cálculo de similitud semántica entre CV y descripción de puesto.
    Retorna un resultado simulado.
    """
    print("\n--- Generación de Embeddings para Matching Semántico ---")
    
    # Similitud simulada (valor entre 0 y 1)
    similarity = 0.8547
    print(f"Similitud coseno entre CV y descripción del puesto: {similarity:.4f}")
    return similarity


def generate_interview_questions_example():
    """
    Ejemplo de generación de preguntas de entrevista.
    Retorna preguntas simuladas.
    """
    print("\n--- Generación de Preguntas para Preentrevistas Automáticas ---")
    
    # Preguntas simuladas
    questions = [
        "1. ¿Puedes describir un proyecto específico donde hayas implementado microservicios con Docker y Kubernetes?",
        "2. ¿Cómo optimizarías el rendimiento de una aplicación Django con alta concurrencia?",
        "3. Explica tu experiencia integrando APIs RESTful con aplicaciones React.",
        "4. ¿Qué estrategias utilizas para el manejo de errores en aplicaciones distribuidas?",
        "5. Describe un desafío técnico complejo que hayas enfrentado y cómo lo resolviste."
    ]
    
    print("Preguntas generadas:")
    for question in questions:
        print(question)
    
    return questions


def evaluate_candidate_answer_example():
    """
    Ejemplo de evaluación de respuesta de candidato.
    Retorna evaluación simulada en formato JSON.
    """
    print("\n--- Análisis y Evaluación de Respuestas de Preentrevistas ---")
    
    # Evaluación simulada
    evaluation_data = {
        "calificacion_relevancia": 5,
        "calificacion_profundidad_tecnica": 4,
        "calificacion_claridad": 4,
        "calificacion_desafios_soluciones": 5,
        "comentario": "Excelente respuesta que demuestra experiencia práctica con microservicios. El candidato identifica claramente los desafíos y proporciona soluciones específicas como ELK stack y RabbitMQ.",
        "pregunta_seguimiento": "¿Cómo manejaste el versionado de las APIs entre los diferentes microservicios durante las actualizaciones?"
    }
    
    print(json.dumps(evaluation_data, indent=2, ensure_ascii=False))
    return evaluation_data


# --- EJECUTAR EJEMPLOS (descomenta para probar) ---
"""
if __name__ == "__main__":
    extract_cv_data_example()
    calculate_similarity_example()
    generate_interview_questions_example()
    evaluate_candidate_answer_example()
"""