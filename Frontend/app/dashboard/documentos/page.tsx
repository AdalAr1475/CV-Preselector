"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getCandidates, getOffers, completeAnalysis, extractCVData, calculateSimilarity } from "@/lib/api"
import type { 
  CVExtractionResponse, 
  SimilarityResponse,
  CompleteAnalysisResponse 
} from "@/lib/api"
import type { Candidate, Offer } from "@/lib/definitions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

export default function DocumentsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string>("")
  const [selectedOffer, setSelectedOffer] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [extractionFile, setExtractionFile] = useState<File | null>(null)
  const [cvText, setCvText] = useState<string>("")
  const [jobDescription, setJobDescription] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<CompleteAnalysisResponse | null>(null)
  const [extractionResult, setExtractionResult] = useState<CVExtractionResponse | null>(null)
  const [similarityResult, setSimilarityResult] = useState<SimilarityResponse | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const [candidatesData, offersData] = await Promise.all([
          getCandidates(),
          getOffers()
        ])
        setCandidates(candidatesData)
        setOffers(offersData)
      } catch (error) {
        toast({ 
          title: "Error", 
          description: "No se pudieron cargar los datos.", 
          variant: "destructive" 
        })
      }
    }
    loadData()
  }, [toast])

  // Análisis completo con PDF
  const handleCompleteAnalysis = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedFile || !selectedCandidate || !selectedOffer) {
      toast({ 
        title: "Error", 
        description: "Por favor, selecciona un candidato, una oferta y un archivo.", 
        variant: "destructive" 
      })
      return
    }

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      const result = await completeAnalysis(
        selectedFile, 
        Number.parseInt(selectedCandidate), 
        Number.parseInt(selectedOffer)
      )

      setAnalysisResult(result)
      toast({ 
        title: "Éxito", 
        description: "Análisis completo realizado correctamente." 
      })
    } catch (error) {
      console.error("Error in complete analysis:", error)
      toast({ 
        title: "Error", 
        description: "Error al procesar el análisis completo.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Extracción de datos de CV desde archivo PDF
  const handleCVExtraction = async () => {
    if (!extractionFile) {
      toast({ 
        title: "Error", 
        description: "Por favor, selecciona un archivo PDF.", 
        variant: "destructive" 
      })
      return
    }

    setIsLoading(true)
    setExtractionResult(null)

    try {
      // Primero procesamos el PDF para extraer texto usando nuestro endpoint de backend
      const formData = new FormData()
      formData.append("file", extractionFile)

      // Usamos un candidato temporal (ID 1) solo para extraer el texto
      const tempCandidateId = 1
      const tempOfferId = 1
      
      const extractResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/procesamiento/calificar?candidato_id=${tempCandidateId}&oferta_id=${tempOfferId}`, {
        method: "POST",
        body: formData,
      })

      if (!extractResponse.ok) {
        throw new Error("Error al procesar el archivo PDF")
      }

      const extractData = await extractResponse.json()
      const extractedText = extractData.resultado

      // Ahora usamos el texto extraído para obtener datos estructurados
      const result = await extractCVData({ texto_cv: extractedText })
      setExtractionResult(result)
      setCvText(extractedText) // Guardamos el texto extraído para otros usos
      
      toast({ 
        title: "Éxito", 
        description: "Datos del CV extraídos correctamente desde PDF." 
      })
    } catch (error) {
      console.error("Error in CV extraction:", error)
      toast({ 
        title: "Error", 
        description: "Error al extraer datos del CV desde PDF.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Cálculo de similitud
  const handleSimilarityCalculation = async () => {
    if (!cvText.trim() || !jobDescription.trim()) {
      toast({ 
        title: "Error", 
        description: "Por favor, ingresa tanto el CV como la descripción del puesto.", 
        variant: "destructive" 
      })
      return
    }

    setIsLoading(true)
    setSimilarityResult(null)

    try {
      const result = await calculateSimilarity({
        cv_resumen: cvText,
        job_description: jobDescription
      })
      setSimilarityResult(result)
      toast({ 
        title: "Éxito", 
        description: "Similitud calculada correctamente." 
      })
    } catch (error) {
      console.error("Error in similarity calculation:", error)
      toast({ 
        title: "Error", 
        description: "Error al calcular similitud.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="complete" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="complete">Análisis Completo</TabsTrigger>
          <TabsTrigger value="extract">Extraer CV</TabsTrigger>
          <TabsTrigger value="similarity">Similitud</TabsTrigger>
        </TabsList>

        {/* TAB 1: Análisis Completo */}
        <TabsContent value="complete" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Análisis Completo de CV</CardTitle>
                <CardDescription>
                  Sube un CV en PDF para análisis completo: extracción de datos, similitud con oferta y generación de preguntas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompleteAnalysis} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="candidate">Candidato</Label>
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
                    <Label htmlFor="offer">Oferta Laboral</Label>
                    <Select value={selectedOffer} onValueChange={setSelectedOffer}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una oferta" />
                      </SelectTrigger>
                      <SelectContent>
                        {offers.map((o) => (
                          <SelectItem key={o.id} value={String(o.id)}>
                            {o.titulo}
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
                    {isLoading ? "Analizando..." : "Realizar Análisis Completo"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Resultados del Análisis Completo */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultados del Análisis Completo</CardTitle>
                  <CardDescription>
                    Score de similitud: <Badge variant="secondary">
                      {analysisResult.similitud.porcentaje.toFixed(2)}% - {analysisResult.similitud.nivel}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Información General</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Candidato ID:</strong> {analysisResult.candidato_id}</p>
                      <p><strong>Oferta ID:</strong> {analysisResult.oferta_id}</p>
                      <p><strong>Postulación ID:</strong> {analysisResult.postulacion_id}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Datos Extraídos</h4>
                    {typeof analysisResult.datos_extraidos === 'object' && analysisResult.datos_extraidos.nombre_completo && (
                      <div className="text-sm space-y-1">
                        <p><strong>Nombre:</strong> {analysisResult.datos_extraidos.nombre_completo}</p>
                        <p><strong>Email:</strong> {analysisResult.datos_extraidos.email}</p>
                        <p><strong>Teléfono:</strong> {analysisResult.datos_extraidos.telefono}</p>
                        <p><strong>Habilidades:</strong> {analysisResult.datos_extraidos.habilidades?.join(", ")}</p>
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-semibold mb-2">Similitud con la Oferta</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={analysisResult.similitud.nivel === "Excelente" ? "default" : 
                                   analysisResult.similitud.nivel === "Bueno" ? "secondary" : "outline"}>
                        {analysisResult.similitud.porcentaje.toFixed(1)}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {analysisResult.similitud.nivel}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Extracción de CV */}
        <TabsContent value="extract" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Extraer Datos de CV</CardTitle>
                <CardDescription>
                  Sube un CV en PDF para extraer información estructurada usando IA.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="extractionFile">Archivo PDF del CV</Label>
                  <Input
                    id="extractionFile"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setExtractionFile(e.target.files?.[0] || null)}
                  />
                  {extractionFile && (
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: {extractionFile.name}
                    </p>
                  )}
                </div>
                
                {cvText && (
                  <div className="space-y-2">
                    <Label>Texto Extraído (Vista Previa)</Label>
                    <div className="max-h-32 overflow-y-auto p-3 bg-muted/50 rounded-md text-sm">
                      {cvText.substring(0, 300)}...
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={handleCVExtraction} 
                  disabled={isLoading || !extractionFile} 
                  className="w-full"
                >
                  {isLoading ? "Extrayendo..." : "Extraer Datos del CV"}
                </Button>
              </CardContent>
            </Card>

            {/* Resultados de Extracción */}
            {extractionResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Datos Extraídos</CardTitle>
                  <CardDescription>
                    Información estructurada extraída del CV
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Nombre:</strong>
                      <p>{extractionResult.nombre_completo || "No encontrado"}</p>
                    </div>
                    <div>
                      <strong>Email:</strong>
                      <p>{extractionResult.email || "No encontrado"}</p>
                    </div>
                    <div>
                      <strong>Teléfono:</strong>
                      <p>{extractionResult.telefono || "No encontrado"}</p>
                    </div>
                    <div>
                      <strong>Resumen:</strong>
                      <p className="text-xs">{extractionResult.resumen || "No encontrado"}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <strong className="text-sm">Habilidades:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {extractionResult.habilidades?.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {extractionResult.experiencia_laboral?.length > 0 && (
                    <div>
                      <strong className="text-sm">Experiencia:</strong>
                      <div className="space-y-2 mt-1">
                        {extractionResult.experiencia_laboral.map((exp, index) => (
                          <div key={index} className="text-xs border-l-2 border-muted pl-2">
                            <p><strong>{exp.puesto}</strong> en {exp.empresa}</p>
                            <p className="text-muted-foreground">{exp.periodo}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TAB 3: Similitud */}
        <TabsContent value="similarity" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Calcular Similitud</CardTitle>
                <CardDescription>
                  Compara un CV con una descripción de puesto para obtener un score de similitud.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cvTextSim">Resumen del CV</Label>
                    {cvText && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // El texto ya está disponible desde la extracción
                          toast({ 
                            title: "Texto cargado", 
                            description: "Se ha cargado el texto del CV extraído anteriormente." 
                          })
                        }}
                      >
                        Usar CV Extraído
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="cvTextSim"
                    placeholder="Resumen o texto completo del CV..."
                    value={cvText}
                    onChange={(e) => setCvText(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="jobDesc">Descripción del Puesto</Label>
                    {selectedOffer && offers.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const selectedOfferData = offers.find(o => o.id === Number.parseInt(selectedOffer))
                          if (selectedOfferData?.descripcion) {
                            setJobDescription(selectedOfferData.descripcion)
                            toast({ 
                              title: "Descripción cargada", 
                              description: "Se ha cargado la descripción de la oferta seleccionada." 
                            })
                          }
                        }}
                      >
                        Usar Oferta Seleccionada
                      </Button>
                    )}
                  </div>
                  <Textarea
                    id="jobDesc"
                    placeholder="Descripción completa del puesto de trabajo..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button 
                  onClick={handleSimilarityCalculation} 
                  disabled={isLoading || !cvText.trim() || !jobDescription.trim()} 
                  className="w-full"
                >
                  {isLoading ? "Calculando..." : "Calcular Similitud"}
                </Button>
              </CardContent>
            </Card>

            {/* Resultados de Similitud */}
            {similarityResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Resultado de Similitud</CardTitle>
                  <CardDescription>
                    Compatibilidad entre el CV y el puesto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {similarityResult.porcentaje.toFixed(1)}%
                    </div>
                    <Badge 
                      variant={similarityResult.nivel === "Excelente" ? "default" : 
                              similarityResult.nivel === "Bueno" ? "secondary" : "outline"}
                      className="text-lg py-1 px-3"
                    >
                      {similarityResult.nivel}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score técnico:</span>
                      <span>{similarityResult.similitud.toFixed(4)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${similarityResult.porcentaje}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {similarityResult.nivel === "Excelente" && "¡Excelente match! Este candidato tiene alta compatibilidad con el puesto."}
                      {similarityResult.nivel === "Bueno" && "Buen match. El candidato cumple con la mayoría de requisitos."}
                      {similarityResult.nivel === "Regular" && "Match moderado. Revisar experiencia específica requerida."}
                      {similarityResult.nivel === "Bajo" && "Compatibilidad baja. Considerar otros candidatos."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Loading overlay */}
      {isLoading && (
        <Card className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            <p className="text-lg font-medium">Procesando con IA...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
