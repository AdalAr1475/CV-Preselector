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

// Este es el tipo de dato que RECIBES de la API (equivale a CandidatoResponse)
export interface Candidate {
  id: number;
  creado_en: string;
  nombre_completo: string | null; // Puede ser null
  correo: string | null;          // Puede ser null
  telefono: string | null;        // Puede ser null
  linkedin: string | null;        // Puede ser null
}

// Este es el tipo de dato que ENVÍAS a la API para crear (equivale a CandidatoCreate)
// Es el resultado de tu formulario validado por Zod.
export type CandidateCreateData = {
  nombre_completo: string;
  correo: string;
  telefono?: string | null;
  linkedin?: string | null;
};

export interface DocumentAnalysis {
  extracted_text: string
  score: number
}

export interface RankedCandidate {
  candidate: Candidate
  score: number
}
