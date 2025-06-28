import { z } from "zod"

export const companySchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
})

export const offerSchema = z.object({
  title: z.string().min(5, { message: "El título debe tener al menos 5 caracteres." }),
  description: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
  company_id: z.coerce.number().min(1, { message: "Debes seleccionar una empresa." }),
})

export const candidateSchema = z.object({
  nombre_completo: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  correo: z.string().email({ message: "Por favor, introduce un email válido." }),
  telefono: z.string().optional(),
  linkedin: z.string().url({ message: "Debes ingresar un URL válido de LinkedIn." }).optional(),
})

