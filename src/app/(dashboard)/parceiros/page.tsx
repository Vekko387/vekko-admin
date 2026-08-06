import { Badge } from "@/components/ui/badge";
import { PartnerApplicationsPanel } from "@/features/partner-applications/partner-applications-panel";
import { ApprovedPartnersPanel } from "@/features/partners/approved-partners-panel";

export default function PartnersPage() {
  return (
    <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="space-y-2">
          <Badge variant="secondary">Bloco 03 · Fase 02</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Parceiros</h1>
          <p className="max-w-3xl text-muted-foreground">Gerencie solicitações pendentes e estabelecimentos aprovados sem excluir o histórico.</p>
        </header>
        <PartnerApplicationsPanel />
        <ApprovedPartnersPanel />
      </section>
    </main>
  );
}
