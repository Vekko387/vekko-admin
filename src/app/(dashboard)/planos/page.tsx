import { Badge } from "@/components/ui/badge";
import { PlansPanel } from "@/features/plans/plans-panel";

export default function PlansPage() {
  return (
    <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-2">
          <Badge variant="secondary">Bloco 2 · Fase 02</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Planos</h1>
          <p className="max-w-2xl text-muted-foreground">
            Gerencie os quatro planos oficiais, seus preços, benefícios,
            elegibilidade e disponibilidade no aplicativo.
          </p>
        </header>
        <PlansPanel />
      </section>
    </main>
  );
}
