import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const foundations = [
  {
    title: "Operação",
    description: "Usuários, veículos, parceiros, unidades e atendimentos.",
  },
  {
    title: "Financeiro",
    description: "Assinaturas, pagamentos, recebíveis e repasses.",
  },
  {
    title: "Governança",
    description: "RBAC, suporte, auditoria e configurações operacionais.",
  },
] as const;

export default function AdminHomePage() {
  return (
    <main className="flex flex-1 items-center bg-background px-6 py-16">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <div className="flex max-w-3xl flex-col items-start gap-5">
          <Badge variant="outline">Fundação técnica v0.1.0</Badge>
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-[0.28em] text-muted-foreground uppercase">
              VEKKO
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Painel interno de gestão
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Base preparada para concentrar a operação administrativa,
              financeira e de suporte da plataforma.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/dashboard">Visualizar dashboard</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Acessar entrada</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {foundations.map((foundation) => (
            <Card key={foundation.title}>
              <CardHeader>
                <CardTitle>{foundation.title}</CardTitle>
                <CardDescription>{foundation.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Estrutura preparada</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
