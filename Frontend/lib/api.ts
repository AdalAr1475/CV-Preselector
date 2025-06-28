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
    throw new Error(`Failed to fetch ${endpoint}`)
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
      "Content-Type": "application/json", // Es buena práctica incluir este header
    },
    body: JSON.stringify(data),
  });

// Selección
export const getRankedCandidatesForOffer = (offerId: number) =>
  fetchAPI<RankedCandidate[]>(`/seleccion/oferta/${offerId}`)

// Procesamiento de Documentos
export const processDocument = async (file: File, candidateId: number, offerId: number): Promise<any> => {
  const formData = new FormData()
  formData.append("file", file)

  // CORRECCIÓN: URL completa y ambos IDs como query params.
  const url = `${API_BASE_URL}/procesamiento/calificar?candidato_id=${candidateId}&oferta_id=${offerId}`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    // Para depurar, es útil ver el error que devuelve la API
    const errorBody = await response.json();
    console.error("API Error:", errorBody);
    throw new Error(errorBody.detail || "Failed to process document");
  }
  return response.json()
}
