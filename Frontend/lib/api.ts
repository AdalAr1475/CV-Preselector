import type { Company, Offer, Candidate, RankedCandidate, CandidateCreateData } from "./definitions"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 0 }, // No cache para datos dinámicos
  }

  const response = await fetch(url, { ...defaultOptions, ...options })

  if (!response.ok) {
    console.error(`API error: ${response.status} ${response.statusText}`)
    const errorBody = await response.text()
    console.error("Error body:", errorBody)
    throw new Error(`Failed to fetch ${endpoint}: ${response.status}`)
  }

  return response.json()
}

// Empresas
export const getCompanies = () => fetchAPI<Company[]>("/empresas")
export const getCompanyById = (id: number) => fetchAPI<Company>(`/empresas/${id}`)
export const createCompany = (data: Omit<Company, "id">) =>
  fetchAPI<Company>("/empresas", {
    method: "POST",
    body: JSON.stringify(data),
  })

// Ofertas
export const getOffers = () => fetchAPI<Offer[]>("/ofertas")
export const createOffer = (data: Omit<Offer, "id" | "company">) =>
  fetchAPI<Offer>("/ofertas", {
    method: "POST",
    body: JSON.stringify(data),
  })

// Candidatos
export const getCandidates = () => fetchAPI<Candidate[]>("/candidatos")
export const createCandidate = (data: CandidateCreateData) =>
  fetchAPI<Candidate>("/candidatos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

// Selección
export const getRankedCandidatesForOffer = (offerId: number) =>
  fetchAPI<RankedCandidate[]>(`/seleccion/oferta/${offerId}`)

// --- NUEVOS ENDPOINTS DE PROCESAMIENTO CON IA ---

// Interfaces para los nuevos endpoints
export interface CVExtractionRequest {
  texto_cv: string
}

export interface CVExtractionResponse {
  nombre_completo?: string
  email?: string
  telefono?: string
  resumen?: string
  experiencia_laboral: Array<{
    puesto?: string
    empresa?: string
    periodo?: string
    descripcion?: string
  }>
  educacion: Array<{
    titulo?: string
    institucion?: string
    periodo?: string
  }>
  habilidades: string[]
}

export interface SimilarityRequest {
  cv_resumen: string
  job_description: string
}

export interface SimilarityResponse {
  similitud: number
  porcentaje: number
  nivel: string
}

export interface QuestionGenerationRequest {
  cv_resumen: string
  job_description: string
}

export interface QuestionGenerationResponse {
  status: string
  preguntas: string
  cv_resumen: string
  job_description: string
  nota?: string
}

export interface AnswerEvaluationRequest {
  pregunta: string
  respuesta_candidato: string
}

export interface AnswerEvaluationResponse {
  status: string
  evaluacion: {
    calificacion_relevancia: number
    calificacion_profundidad_tecnica: number
    calificacion_claridad: number
    calificacion_desafios_soluciones: number
    comentario: string
    pregunta_seguimiento: string
  }
  pregunta_original: string
  respuesta_evaluada: string
  nota?: string
}

export interface CompleteAnalysisResponse {
  status: string
  message: string
  candidato_id: number
  oferta_id: number
  archivo_guardado: string
  datos_extraidos: CVExtractionResponse
  similitud: {
    score: number
    porcentaje: number
    nivel: string
  }
  preguntas_generadas: any
  postulacion_id: number
}

// 1. Extracción de datos de CV
export const extractCVData = (data: CVExtractionRequest) =>
  fetchAPI<CVExtractionResponse>("/procesamiento/extraer-cv", {
    method: "POST",
    body: JSON.stringify(data),
  })

// 2. Cálculo de similitud semántica
export const calculateSimilarity = (data: SimilarityRequest) =>
  fetchAPI<SimilarityResponse>("/procesamiento/similitud", {
    method: "POST",
    body: JSON.stringify(data),
  })

// 3. Generación de preguntas de entrevista
export const generateInterviewQuestions = (data: QuestionGenerationRequest) =>
  fetchAPI<QuestionGenerationResponse>("/procesamiento/generar-preguntas", {
    method: "POST",
    body: JSON.stringify(data),
  })

// 4. Evaluación de respuestas
export const evaluateAnswer = (data: AnswerEvaluationRequest) =>
  fetchAPI<AnswerEvaluationResponse>("/procesamiento/evaluar-respuesta", {
    method: "POST",
    body: JSON.stringify(data),
  })

// 5. Análisis completo de CV
export const completeAnalysis = async (
  file: File,
  candidateId: number,
  offerId: number
): Promise<CompleteAnalysisResponse> => {
  const formData = new FormData()
  formData.append("file", file)

  const url = `${API_BASE_URL}/procesamiento/analisis-completo/${candidateId}/${offerId}`

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.json()
    console.error("API Error:", errorBody)
    throw new Error(errorBody.detail || "Failed to process complete analysis")
  }
  return response.json()
}

// Procesamiento de Documentos (endpoint original)
export const processDocument = async (file: File, candidateId: number, offerId: number): Promise<any> => {
  const formData = new FormData()
  formData.append("file", file)

  const url = `${API_BASE_URL}/procesamiento/calificar?candidato_id=${candidateId}&oferta_id=${offerId}`

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.json()
    console.error("API Error:", errorBody)
    throw new Error(errorBody.detail || "Failed to process document")
  }
  return response.json()
}
