import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <main className="text-center p-8">
        <h1 className="text-5xl font-bold mb-4">Plataforma de Selección con IA</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Optimiza tu proceso de contratación. Analizamos CVs, rankeamos candidatos y te ayudamos a encontrar el talento
          ideal de forma más rápida y eficiente.
        </p>
        <Button asChild size="lg">
          <Link href="/dashboard">Ir al Dashboard</Link>
        </Button>
      </main>
    </div>
  )
}
