"use client";

import { LoaderCircle, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  createService,
  listServices,
  updateService,
  updateServiceStatus,
} from "./partner-units-service";
import type { ServiceCatalogItem } from "./partner-unit";

const inputClassName =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:bg-muted";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível atualizar o catálogo de serviços.";
}

function ServiceForm({
  onCancel,
  onSaved,
  service,
}: {
  onCancel: () => void;
  onSaved: () => Promise<void>;
  service?: ServiceCatalogItem;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const code = String(data.get("code") ?? "")
      .trim()
      .toUpperCase();
    const name = String(data.get("name") ?? "").trim();
    const description = String(data.get("description") ?? "").trim();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      if (service) {
        await updateService(service.id, {
          name,
          ...(description ? { description } : {}),
        });
      } else {
        await createService({
          code,
          name,
          ...(description ? { description } : {}),
        });
      }
      await onSaved();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="ring-2 ring-primary/15">
      <CardHeader>
        <CardTitle>
          {service ? `Editar ${service.name}` : "Novo serviço"}
        </CardTitle>
        <CardDescription>
          O código é imutável após a criação e não há exclusão definitiva.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {errorMessage ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              Código
              <input
                className={inputClassName}
                defaultValue={service?.code ?? ""}
                disabled={Boolean(service) || isSaving}
                maxLength={60}
                name="code"
                pattern="[A-Z][A-Z0-9_]*"
                required
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Nome
              <input
                className={inputClassName}
                defaultValue={service?.name ?? ""}
                disabled={isSaving}
                maxLength={120}
                minLength={2}
                name="name"
                required
              />
            </label>
          </div>
          <label className="block space-y-1.5 text-sm font-medium">
            Descrição
            <textarea
              className="min-h-24 w-full resize-y rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              defaultValue={service?.description ?? ""}
              disabled={isSaving}
              maxLength={500}
              name="description"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Salvando..." : "Salvar serviço"}
            </Button>
            <Button
              disabled={isSaving}
              onClick={onCancel}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ServicesCatalogPanel() {
  const [services, setServices] = useState<ServiceCatalogItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setServices(await listServices());
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    void listServices()
      .then((result) => {
        if (!ignore) {
          setServices(result);
          setErrorMessage(null);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function handleStatus(service: ServiceCatalogItem) {
    const nextStatus = service.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = nextStatus === "ACTIVE" ? "ativar" : "inativar";
    if (!window.confirm(`Deseja ${action} o serviço ${service.name}?`)) return;

    setPendingId(service.id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await updateServiceStatus(service.id, nextStatus);
      await load();
      setSuccessMessage(
        `Serviço ${nextStatus === "ACTIVE" ? "ativado" : "inativado"} com sucesso.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingId(null);
    }
  }

  const editingService = services.find((service) => service.id === editingId);

  return (
    <section className="space-y-6" aria-labelledby="services-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold" id="services-title">
              Catálogo de serviços
            </h2>
            <Badge variant="secondary">{services.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Serviços oficiais que podem ser oferecidos pelas unidades.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={isLoading}
            onClick={() => void load()}
            variant="outline"
          >
            <RefreshCw
              className={isLoading ? "animate-spin" : undefined}
              aria-hidden="true"
            />{" "}
            Atualizar
          </Button>
          <Button onClick={() => setShowCreate(true)}>
            <Plus aria-hidden="true" /> Novo serviço
          </Button>
        </div>
      </div>

      {successMessage ? (
        <p
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700"
          role="status"
        >
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}
      {showCreate ? (
        <ServiceForm
          onCancel={() => setShowCreate(false)}
          onSaved={async () => {
            setShowCreate(false);
            setSuccessMessage("Serviço criado com sucesso.");
            await load();
          }}
        />
      ) : null}
      {editingService ? (
        <ServiceForm
          key={editingService.updatedAt}
          onCancel={() => setEditingId(null)}
          onSaved={async () => {
            setEditingId(null);
            setSuccessMessage("Serviço atualizado com sucesso.");
            await load();
          }}
          service={editingService}
        />
      ) : null}

      {isLoading && services.length === 0 ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <LoaderCircle className="animate-spin" aria-hidden="true" />{" "}
          Carregando catálogo...
        </div>
      ) : null}
      {!isLoading && services.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum serviço cadastrado.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <Card
            className={service.status === "INACTIVE" ? "opacity-75" : undefined}
            key={service.id}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>{service.code}</CardDescription>
                </div>
                <Badge
                  variant={
                    service.status === "ACTIVE" ? "secondary" : "outline"
                  }
                >
                  {service.status === "ACTIVE" ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {service.description || "Sem descrição."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={pendingId !== null}
                  onClick={() => setEditingId(service.id)}
                  variant="outline"
                >
                  Editar
                </Button>
                <Button
                  disabled={pendingId !== null}
                  onClick={() => void handleStatus(service)}
                  variant={
                    service.status === "ACTIVE" ? "destructive" : "secondary"
                  }
                >
                  {pendingId === service.id
                    ? "Salvando..."
                    : service.status === "ACTIVE"
                      ? "Inativar"
                      : "Ativar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
