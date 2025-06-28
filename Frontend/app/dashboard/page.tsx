import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Empresas</CardTitle>
            <CardDescription>Gestiona las empresas asociadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/empresas">Ver Empresas</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ofertas Laborales</CardTitle>
            <CardDescription>Crea y administra ofertas de trabajo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/ofertas">Ver Ofertas</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Candidatos</CardTitle>
            <CardDescription>Administra la base de datos de candidatos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/candidatos">Ver Candidatos</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Procesar Documentos</CardTitle>
            <CardDescription>Sube y analiza nuevos CVs con IA.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/documentos">Subir CV</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
