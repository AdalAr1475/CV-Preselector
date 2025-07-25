import { getCandidates } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CandidateForm } from "@/components/forms/candidate-form";

export default async function CandidatesPage() {
  const candidates = await getCandidates();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Candidatos</CardTitle>
          <CardDescription>
            Listado de todos los candidatos registrados.
          </CardDescription>
        </div>
        <CandidateForm />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id}>
                <TableCell>{candidate.id}</TableCell>
                {/* CORREGIDO: Usar nombre_completo en lugar de name */}
                <TableCell className="font-medium">
                  {candidate.nombre_completo}
                </TableCell>
                {/* CORREGIDO: Usar correo en lugar de email */}
                <TableCell>{candidate.correo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
