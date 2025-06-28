"use client"

import { useFormState, useFormStatus } from "react-dom"
import { createOfferAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import type { Company } from "@/lib/definitions"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creando..." : "Crear Oferta"}
    </Button>
  )
}

export function OfferForm({ companies }: { companies: Company[] }) {
  const [state, formAction] = useFormState(createOfferAction, { errors: {}, message: "" })
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
        <Button>Crear Oferta</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nueva Oferta</DialogTitle>
          <DialogDescription>Rellena los datos para publicar una nueva oferta laboral.</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" />
            {state.errors?.title && <p className="text-sm text-red-500">{state.errors.title[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" />
            {state.errors?.description && <p className="text-sm text-red-500">{state.errors.description[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company_id">Empresa</Label>
            <Select name="company_id">
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={String(company.id)}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.company_id && <p className="text-sm text-red-500">{state.errors.company_id[0]}</p>}
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
