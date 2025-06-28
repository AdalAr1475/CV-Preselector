import { getRankedCandidatesForOffer } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function OfferRankingPage({ params }: { params: { id: string } }) {
  const offerId = Number.parseInt(params.id, 10)
  const rankedCandidates = await getRankedCandidatesForOffer(offerId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Candidatos para Oferta #{offerId}</CardTitle>
        <CardDescription>
          Candidatos ordenados por su compatibilidad con la oferta según el análisis de IA.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ranking</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Score Semántico</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankedCandidates.map((item, index) => (
              <TableRow key={item.candidate.id}>
                <TableCell className="font-bold">{index + 1}</TableCell>
                <TableCell>{item.candidate.name}</TableCell>
                <TableCell>{item.candidate.email}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={item.score > 0.7 ? "default" : "secondary"}>{(item.score * 100).toFixed(2)}%</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="outline" size="sm" disabled>
                    Iniciar Preentrevista
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
