// Tipos de datos que esperamos del backend de FastAPI

export interface Company {
  id: number
  name: string
  description: string
}

export interface Offer {
  id: number
  title: string
  description: string
  company_id: number
  company?: Company
}

export interface Candidate {
  id: number
  name: string
  email: string
}

export interface DocumentAnalysis {
  extracted_text: string
  score: number
}

export interface RankedCandidate {
  candidate: Candidate
  score: number
}
