import { getOffers, getCompanies } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { OfferForm } from "@/components/forms/offer-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function OffersPage() {
  const [offers, companies] = await Promise.all([getOffers(), getCompanies()])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Ofertas Laborales</CardTitle>
          <CardDescription>Listado de todas las ofertas de trabajo activas.</CardDescription>
        </div>
        <OfferForm companies={companies} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>{offer.id}</TableCell>
                <TableCell className="font-medium">{offer.title}</TableCell>
                <TableCell>{companies.find((c) => c.id === offer.company_id)?.name || "N/A"}</TableCell>
                <TableCell>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/ofertas/${offer.id}`}>Ver Ranking</Link>
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
