"use server"

import { revalidatePath } from "next/cache"
import { createCompany, createOffer, createCandidate } from "./api"
import { companySchema, offerSchema, candidateSchema } from "./validators"

export async function createCompanyAction(prevState: any, formData: FormData) {
  const validatedFields = companySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await createCompany(validatedFields.data)
    revalidatePath("/dashboard/empresas")
    return { message: "Empresa creada con éxito." }
  } catch (error) {
    return { message: "Error al crear la empresa." }
  }
}

export async function createOfferAction(prevState: any, formData: FormData) {
  const validatedFields = offerSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    company_id: formData.get("company_id"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await createOffer(validatedFields.data)
    revalidatePath("/dashboard/ofertas")
    return { message: "Oferta creada con éxito." }
  } catch (error) {
    return { message: "Error al crear la oferta." }
  }
}

export async function createCandidateAction(prevState: any, formData: FormData) {
  const validatedFields = candidateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    await createCandidate(validatedFields.data)
    revalidatePath("/dashboard/candidatos")
    return { message: "Candidato creado con éxito." }
  } catch (error) {
    return { message: "Error al crear el candidato." }
  }
}
