import { Badge } from "@/components/ui/badge";
import { VehiclesPanel } from "@/features/vehicles/vehicles-panel";

export default function VehiclesPage() {
  return (
    <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-2">
          <Badge variant="secondary">Bloco 1 · Fase 02</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Veículos</h1>
          <p className="max-w-2xl text-muted-foreground">
            Consulte veículos, proprietários e controle a situação operacional sem
            excluir o histórico.
          </p>
        </header>
        <VehiclesPanel />
      </section>
    </main>
  );
}
