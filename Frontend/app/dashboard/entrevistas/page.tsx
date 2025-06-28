"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { generateInterviewQuestions, evaluateAnswer } from "@/lib/api"
import type { 
  QuestionGenerationRequest,
  QuestionGenerationResponse,
  AnswerEvaluationRequest,
  AnswerEvaluationResponse 
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InterviewPage() {
  const [cvResumen, setCvResumen] = useState<string>("")
  const [jobDescription, setJobDescription] = useState<string>("")
  const [generatedQuestions, setGeneratedQuestions] = useState<QuestionGenerationResponse | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>("")
  const [candidateAnswer, setCandidateAnswer] = useState<string>("")
  const [evaluationResult, setEvaluationResult] = useState<AnswerEvaluationResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Generar preguntas de entrevista
  const handleGenerateQuestions = async () => {
    if (!cvResumen.trim() || !jobDescription.trim()) {
      toast({ 
        title: "Error", 
        description: "Por favor, completa tanto el resumen del CV como la descripción del puesto.", 
        variant: "destructive" 
      })
      return
    }

    setIsLoading(true)
    setGeneratedQuestions(null)

    try {
      const request: QuestionGenerationRequest = {
        cv_resumen: cvResumen,
        job_description: jobDescription
      }
      
      const result = await generateInterviewQuestions(request)
      setGeneratedQuestions(result)
      toast({ 
        title: "Éxito", 
        description: "Preguntas de entrevista generadas correctamente." 
      })
    } catch (error) {
      console.error("Error generating questions:", error)
      toast({ 
        title: "Error", 
        description: "Error al generar las preguntas de entrevista.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Evaluar respuesta del candidato
  const handleEvaluateAnswer = async () => {
    if (!currentQuestion.trim() || !candidateAnswer.trim()) {
      toast({ 
        title: "Error", 
        description: "Por favor, completa tanto la pregunta como la respuesta del candidato.", 
        variant: "destructive" 
      })
      return
    }

    setIsLoading(true)
    setEvaluationResult(null)

    try {
      const request: AnswerEvaluationRequest = {
        pregunta: currentQuestion,
        respuesta_candidato: candidateAnswer
      }
      
      const result = await evaluateAnswer(request)
      setEvaluationResult(result)
      toast({ 
        title: "Éxito", 
        description: "Respuesta evaluada correctamente." 
      })
    } catch (error) {
      console.error("Error evaluating answer:", error)
      toast({ 
        title: "Error", 
        description: "Error al evaluar la respuesta.", 
        variant: "destructive" 
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para extraer score promedio
  const getAverageScore = (evaluation: any) => {
    if (!evaluation) return 0
    const scores = [
      evaluation.calificacion_relevancia,
      evaluation.calificacion_profundidad_tecnica,
      evaluation.calificacion_claridad,
      evaluation.calificacion_desafios_soluciones
    ]
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }

  // Función para obtener color del badge según el score
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 4) return "default"
    if (score >= 3) return "secondary"
    return "outline"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Entrevistas con IA</h1>
        <p className="text-muted-foreground">
          Genera preguntas personalizadas y evalúa respuestas de candidatos usando inteligencia artificial.
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generar Preguntas</TabsTrigger>
          <TabsTrigger value="evaluate">Evaluar Respuestas</TabsTrigger>
        </TabsList>

        {/* TAB 1: Generar Preguntas */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Generar Preguntas de Entrevista</CardTitle>
                <CardDescription>
                  Proporciona información del candidato y el puesto para generar preguntas personalizadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cvResumen">Resumen del CV del Candidato</Label>
                  <Textarea
                    id="cvResumen"
                    placeholder="Resumen de la experiencia, habilidades y formación del candidato..."
                    value={cvResumen}
                    onChange={(e) => setCvResumen(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Descripción del Puesto</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Descripción completa del puesto, requisitos y responsabilidades..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <Button 
                  onClick={handleGenerateQuestions} 
                  disabled={isLoading || !cvResumen.trim() || !jobDescription.trim()} 
                  className="w-full"
                >
                  {isLoading ? "Generando preguntas..." : "Generar Preguntas de Entrevista"}
                </Button>
              </CardContent>
            </Card>

            {/* Preguntas Generadas */}
            {generatedQuestions && (
              <Card>
                <CardHeader>
                  <CardTitle>Preguntas Generadas</CardTitle>
                  <CardDescription>
                    Preguntas personalizadas para la entrevista
                    {generatedQuestions.nota && (
                      <Badge variant="outline" className="ml-2">
                        {generatedQuestions.status === "success_simulated" ? "Simulado" : "IA"}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm p-4 bg-muted/50 rounded-md">
                      {generatedQuestions.preguntas}
                    </div>
                  </div>
                  
                  {generatedQuestions.nota && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Nota:</strong> {generatedQuestions.nota}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedQuestions.preguntas)
                        toast({ title: "Copiado", description: "Preguntas copiadas al portapapeles" })
                      }}
                    >
                      Copiar Preguntas
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const questions = generatedQuestions.preguntas.split('\n').filter(q => q.trim())
                        if (questions.length > 0) {
                          setCurrentQuestion(questions[0].replace(/^\d+\.\s*/, ''))
                        }
                      }}
                    >
                      Usar Primera Pregunta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* TAB 2: Evaluar Respuestas */}
        <TabsContent value="evaluate" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evaluar Respuesta del Candidato</CardTitle>
                <CardDescription>
                  Evalúa la respuesta de un candidato a una pregunta de entrevista.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentQuestion">Pregunta de la Entrevista</Label>
                  <Textarea
                    id="currentQuestion"
                    placeholder="¿Cuál fue la pregunta que se le hizo al candidato?"
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="candidateAnswer">Respuesta del Candidato</Label>
                  <Textarea
                    id="candidateAnswer"
                    placeholder="Transcribe aquí la respuesta completa del candidato..."
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
                
                <Button 
                  onClick={handleEvaluateAnswer} 
                  disabled={isLoading || !currentQuestion.trim() || !candidateAnswer.trim()} 
                  className="w-full"
                >
                  {isLoading ? "Evaluando respuesta..." : "Evaluar Respuesta"}
                </Button>
              </CardContent>
            </Card>

            {/* Evaluación de la Respuesta */}
            {evaluationResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Evaluación de la Respuesta</CardTitle>
                  <CardDescription>
                    Score promedio: 
                    <Badge 
                      variant={getScoreBadgeVariant(getAverageScore(evaluationResult.evaluacion))}
                      className="ml-2"
                    >
                      {getAverageScore(evaluationResult.evaluacion).toFixed(1)}/5
                    </Badge>
                    {evaluationResult.nota && (
                      <Badge variant="outline" className="ml-2">
                        {evaluationResult.status === "success_simulated" ? "Simulado" : "IA"}
                      </Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Scores detallados */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Relevancia</span>
                        <Badge variant={getScoreBadgeVariant(evaluationResult.evaluacion.calificacion_relevancia)}>
                          {evaluationResult.evaluacion.calificacion_relevancia}/5
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Profundidad Técnica</span>
                        <Badge variant={getScoreBadgeVariant(evaluationResult.evaluacion.calificacion_profundidad_tecnica)}>
                          {evaluationResult.evaluacion.calificacion_profundidad_tecnica}/5
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Claridad</span>
                        <Badge variant={getScoreBadgeVariant(evaluationResult.evaluacion.calificacion_claridad)}>
                          {evaluationResult.evaluacion.calificacion_claridad}/5
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Soluciones</span>
                        <Badge variant={getScoreBadgeVariant(evaluationResult.evaluacion.calificacion_desafios_soluciones)}>
                          {evaluationResult.evaluacion.calificacion_desafios_soluciones}/5
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Comentario */}
                  <div>
                    <h4 className="font-semibold mb-2">Comentario de la Evaluación</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                      {evaluationResult.evaluacion.comentario}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  {/* Pregunta de seguimiento */}
                  <div>
                    <h4 className="font-semibold mb-2">Pregunta de Seguimiento Sugerida</h4>
                    <p className="text-sm p-3 bg-blue-50 border border-blue-200 rounded-md">
                      {evaluationResult.evaluacion.pregunta_seguimiento}
                    </p>
                  </div>
                  
                  {evaluationResult.nota && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Nota:</strong> {evaluationResult.nota}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setCurrentQuestion(evaluationResult.evaluacion.pregunta_seguimiento)
                        setCandidateAnswer("")
                      }}
                    >
                      Usar Pregunta de Seguimiento
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const report = `
EVALUACIÓN DE ENTREVISTA

Pregunta: ${evaluationResult.pregunta_original}

Respuesta: ${evaluationResult.respuesta_evaluada}

CALIFICACIONES:
- Relevancia: ${evaluationResult.evaluacion.calificacion_relevancia}/5
- Profundidad Técnica: ${evaluationResult.evaluacion.calificacion_profundidad_tecnica}/5
- Claridad: ${evaluationResult.evaluacion.calificacion_claridad}/5
- Soluciones: ${evaluationResult.evaluacion.calificacion_desafios_soluciones}/5

PROMEDIO: ${getAverageScore(evaluationResult.evaluacion).toFixed(1)}/5

COMENTARIO: ${evaluationResult.evaluacion.comentario}

PREGUNTA DE SEGUIMIENTO: ${evaluationResult.evaluacion.pregunta_seguimiento}
                        `
                        navigator.clipboard.writeText(report.trim())
                        toast({ title: "Copiado", description: "Reporte de evaluación copiado al portapapeles" })
                      }}
                    >
                      Copiar Reporte
                    </Button>
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
