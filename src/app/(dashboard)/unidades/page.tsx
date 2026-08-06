import { Badge } from "@/components/ui/badge";
import { AdminUnitsPanel } from "@/features/partner-units/admin-units-panel";
import { ServicesCatalogPanel } from "@/features/partner-units/services-catalog-panel";

export default function AdminUnitsPage() {
  return (
    <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="space-y-2">
          <Badge variant="secondary">Bloco 04 · Fase 02</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Unidades e serviços
          </h1>
          <p className="max-w-3xl text-muted-foreground">
            Controle a operação das unidades parceiras e o catálogo central de
            serviços.
          </p>
        </header>
        <AdminUnitsPanel />
        <ServicesCatalogPanel />
      </section>
    </main>
  );
}
