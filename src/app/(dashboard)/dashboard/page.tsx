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

const modules = [
  "Usuários e veículos",
  "Parceiros e unidades",
  "Planos e assinaturas",
  "Pagamentos e webhooks",
  "Atendimentos e autorizações",
  "Recebíveis e repasses",
] as const;

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-muted/20 px-6 py-10">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <Badge variant="secondary">Fase 1</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              Estrutura do dashboard
            </h1>
            <p className="text-muted-foreground">
              Módulos previstos pelo Documento Mestre da VEKKO.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((moduleName) => (
            <Card key={moduleName}>
              <CardHeader>
                <CardTitle>{moduleName}</CardTitle>
                <CardDescription>
                  O domínio será implementado na fase correspondente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">Planejado</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
