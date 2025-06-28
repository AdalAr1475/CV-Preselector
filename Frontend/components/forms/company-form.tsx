"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createCompanyAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
      {pending ? "Creando..." : "Crear Empresa"}
    </Button>
  )
}

export function CompanyForm() {
  const [state, formAction] = useFormState(createCompanyAction, { errors: {}, message: "" })
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (state.message?.includes("éxito")) {
      setOpen(false)
      toast({
        title: "Éxito",
        description: state.message,
      })
    } else if (state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      })
    }
  }, [state, toast])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear Empresa</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Empresa</DialogTitle>
          <DialogDescription>Rellena los datos para registrar una nueva empresa.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" />
            {state.errors?.name && <p className="text-sm text-red-500">{state.errors.name[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" />
            {state.errors?.description && <p className="text-sm text-red-500">{state.errors.description[0]}</p>}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
