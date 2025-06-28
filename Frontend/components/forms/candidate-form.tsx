"use client"

import { useFormStatus } from "react-dom"
// Importa el nuevo tipo desde tu archivo de acciones
import { createCandidateAction, CandidateFormState } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useActionState, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creando..." : "Crear Candidato"}
    </Button>
  )
}

export function CandidateForm() {
  // Define el estado inicial con el tipo explícito para mayor seguridad
  const initialState: CandidateFormState = {
    errors: {},
    message: "",
  };
  const [state, formAction] = useActionState(createCandidateAction, initialState);
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message?.includes("éxito")) {
      setOpen(false)
      toast({ title: "Éxito", description: state.message })
    } else if (state.message) {
      toast({ title: "Error", description: state.message, variant: "destructive" })
    }
  }, [state, toast])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear Candidato</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Candidato</DialogTitle>
          <DialogDescription>
            Rellena los datos para registrar un nuevo candidato.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          {/* 2. Nombres de campo corregidos */}
          <div className="grid gap-2">
            <Label htmlFor="nombre_completo">Nombre Completo</Label>
            <Input id="nombre_completo" name="nombre_completo" />
            {state.errors?.nombre_completo && (
              <p className="text-sm text-red-500">{state.errors.nombre_completo[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="correo">Email</Label>
            <Input id="correo" name="correo" type="email" />
            {state.errors?.correo && (
              <p className="text-sm text-red-500">{state.errors.correo[0]}</p>
            )}
          </div>
          
          {/* 3. Campos opcionales añadidos */}
          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono (Opcional)</Label>
            <Input id="telefono" name="telefono" />
            {state.errors?.telefono && (
              <p className="text-sm text-red-500">{state.errors.telefono[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="linkedin">LinkedIn (Opcional)</Label>
            <Input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/..."/>
            {state.errors?.linkedin && (
              <p className="text-sm text-red-500">{state.errors.linkedin[0]}</p>
            )}
          </div>

          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
