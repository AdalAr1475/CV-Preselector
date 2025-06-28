"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getCandidates, processDocument } from "@/lib/api"
import type { Candidate, DocumentAnalysis } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

export default function DocumentsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysis | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadCandidates() {
      try {
        const data = await getCandidates()
        setCandidates(data)
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los candidatos.", variant: "destructive" })
      }
    }
    loadCandidates()
  }, [toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile || !selectedCandidate) {
      toast({ title: "Error", description: "Por favor, selecciona un candidato y un archivo.", variant: "destructive" })
      return
    }

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      // CORRECCIÓN: Pasamos un offerId fijo (ej: 1) para que la API no falle.
      const offerId = 1; 
      const backendResult = await processDocument(selectedFile, Number.parseInt(selectedCandidate), offerId);

      // CORRECCIÓN: Mapeamos la respuesta del backend a la estructura del frontend.
      const formattedResult: DocumentAnalysis = {
        score: backendResult.score_ia,
        extracted_text: backendResult.resultado,
      };

      setAnalysisResult(formattedResult);
      toast({ title: "Éxito", description: "Documento procesado correctamente." })
    } catch (error) {
      // ...
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Cargar y Analizar CV</CardTitle>
          <CardDescription>
            Sube un CV en formato PDF para que la IA lo analice y lo asocie a un candidato.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="candidate">Asociar a Candidato</Label>
              <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un candidato" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nombre_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Archivo PDF del CV</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Procesando..." : "Analizar Documento"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Analizando...</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados del Análisis</CardTitle>
            <CardDescription>
              Score de compatibilidad: <Badge>{(analysisResult.score * 100).toFixed(2)}%</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold mb-2">Texto Extraído:</h3>
            <div className="prose prose-sm max-w-none h-64 overflow-y-auto p-2 border rounded-md bg-muted/50">
              <p>{analysisResult.extracted_text}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
