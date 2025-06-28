"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createCandidateAction } from "@/lib/actions"
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
import { useEffect, useState } from "react"
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
  const [state, formAction] = useFormState(createCandidateAction, { errors: {}, message: "" })
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
          <DialogDescription>Rellena los datos para registrar un nuevo candidato.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input id="name" name="name" />
            {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" />
            {state.errors?.email && <p className="text-sm text-red-500">{state.errors.email[0]}</p>}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
