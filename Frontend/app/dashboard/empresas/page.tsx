import { getCompanies } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CompanyForm } from "@/components/forms/company-form"

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Empresas</CardTitle>
          <CardDescription>Listado de todas las empresas registradas en el sistema.</CardDescription>
        </div>
        <CompanyForm />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>{company.id}</TableCell>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
