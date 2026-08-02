import { Badge } from "@/components/ui/badge";
import { AdminIdentity } from "@/features/auth/admin-identity";
import { PartnerApplicationsPanel } from "@/features/partner-applications/partner-applications-panel";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <Badge variant="secondary">Painel autenticado</Badge>
            <h1 className="text-3xl font-semibold tracking-tight">Operação VEKKO</h1>
            <p className="text-muted-foreground">
              Análise e liberação de novos estabelecimentos parceiros.
            </p>
          </div>
          <AdminIdentity />
        </header>

        <PartnerApplicationsPanel />
      </section>
    </main>
  );
}
