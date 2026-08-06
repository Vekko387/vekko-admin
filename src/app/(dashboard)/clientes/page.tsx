import { Badge } from "@/components/ui/badge";
import { CustomersPanel } from "@/features/customers/customers-panel";

export default function CustomersPage() {
  return (
    <main className="min-h-screen bg-muted/20 px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="space-y-2">
          <Badge variant="secondary">Bloco 1 · Fase 02</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Clientes</h1>
          <p className="max-w-2xl text-muted-foreground">
            Consulte perfis, acompanhe a quantidade de veículos e controle o
            acesso das contas de clientes.
          </p>
        </header>
        <CustomersPanel />
      </section>
    </main>
  );
}
