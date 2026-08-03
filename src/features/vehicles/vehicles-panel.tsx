"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/services/api-error";

import type {
  AdminVehicle,
  AdminVehicleList,
  VehicleStatus,
  VehicleType,
} from "./vehicle";
import {
  listAdminVehicles,
  updateAdminVehicleStatus,
} from "./vehicles-service";

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  HATCH: "Hatch",
  PICKUP: "Pickup",
  SEDAN: "Sedan",
  SUV: "SUV",
};

type ReplacementSelection = {
  candidates: AdminVehicle[];
  vehicle: AdminVehicle;
};

function maskCpf(value: string | null): string {
  if (!value) return "CPF não informado";
  return `***.${value.slice(3, 6)}.${value.slice(6, 9)}-**`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "Não foi possível carregar os veículos.";
}

function VehicleStatusBadge({ vehicle }: { vehicle: AdminVehicle }) {
  if (vehicle.status === "INACTIVE") {
    return <Badge variant="outline">Inativo</Badge>;
  }

  return vehicle.isPrimary ? (
    <Badge variant="secondary">Principal</Badge>
  ) : (
    <Badge variant="secondary">Ativo</Badge>
  );
}

function VehicleDetails({ vehicle }: { vehicle: AdminVehicle }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {vehicle.nickname || `${vehicle.brand} ${vehicle.model}`}
        </CardTitle>
        <CardDescription>
          {vehicle.plateNormalized} · {VEHICLE_TYPE_LABELS[vehicle.type]}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Proprietário
          </p>
          <p className="mt-1 font-medium">
            {vehicle.owner.fullName ?? "Perfil incompleto"}
          </p>
          <p className="text-xs text-muted-foreground">
            {vehicle.owner.email ?? "Sem e-mail"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            CPF
          </p>
          <p className="mt-1 font-medium">{maskCpf(vehicle.owner.cpfNormalized)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Veículo
          </p>
          <p className="mt-1 font-medium">
            {vehicle.color}
            {vehicle.year ? ` · ${vehicle.year}` : ""}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Status
          </p>
          <div className="mt-1">
            <VehicleStatusBadge vehicle={vehicle} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function VehiclesPanel() {
  const [data, setData] = useState<AdminVehicleList | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<VehicleStatus | "">("");
  const [type, setType] = useState<VehicleType | "">("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [pendingVehicleId, setPendingVehicleId] = useState<string | null>(null);
  const [replacementSelection, setReplacementSelection] =
    useState<ReplacementSelection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await listAdminVehicles({
        page,
        ...(search ? { search } : {}),
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      });
      setData(result);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, type]);

  useEffect(() => {
    let ignore = false;

    void listAdminVehicles({
      page,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    })
      .then((result) => {
        if (ignore) return;
        setData(result);
        setErrorMessage(null);
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
  }, [page, search, status, type]);

  const selectedVehicle =
    data?.items.find(({ id }) => id === selectedVehicleId) ?? null;

  const applyUpdatedVehicle = (updated: AdminVehicle) => {
    setData((current) =>
      current
        ? {
            ...current,
            items: current.items.map((item) =>
              item.id === updated.id ? updated : item,
            ),
          }
        : current,
    );
  };

  const changeStatus = async (
    vehicle: AdminVehicle,
    nextStatus: VehicleStatus,
    replacementPrimaryVehicleId?: string,
  ) => {
    setPendingVehicleId(vehicle.id);
    setErrorMessage(null);

    try {
      applyUpdatedVehicle(
        await updateAdminVehicleStatus(
          vehicle.id,
          nextStatus,
          replacementPrimaryVehicleId,
        ),
      );
      await load();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingVehicleId(null);
    }
  };

  const handleStatusChange = async (vehicle: AdminVehicle) => {
    if (vehicle.status === "INACTIVE") {
      if (window.confirm("Reativar este veículo?")) {
        await changeStatus(vehicle, "ACTIVE");
      }
      return;
    }

    if (!window.confirm("Inativar este veículo sem excluir seu histórico?")) {
      return;
    }

    if (!vehicle.isPrimary) {
      await changeStatus(vehicle, "INACTIVE");
      return;
    }

    setPendingVehicleId(vehicle.id);

    try {
      const ownerVehicles = await listAdminVehicles({
        limit: 100,
        status: "ACTIVE",
        userId: vehicle.owner.id,
      });
      const candidates = ownerVehicles.items.filter(({ id }) => id !== vehicle.id);

      if (candidates.length === 0) {
        await changeStatus(vehicle, "INACTIVE");
        return;
      }

      setReplacementSelection({ candidates, vehicle });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingVehicleId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busque por placa, marca, modelo ou proprietário.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_170px_170px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <input
              aria-label="Buscar veículos"
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Placa, veículo ou proprietário"
              value={searchInput}
            />
            <select
              aria-label="Filtrar por status"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as VehicleStatus | "");
              }}
              value={status}
            >
              <option value="">Todos os status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="INACTIVE">Inativos</option>
            </select>
            <select
              aria-label="Filtrar por tipo"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
              onChange={(event) => {
                setPage(1);
                setType(event.target.value as VehicleType | "");
              }}
              value={type}
            >
              <option value="">Todos os tipos</option>
              <option value="HATCH">Hatch</option>
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="PICKUP">Pickup</option>
            </select>
            <Button type="submit">Buscar</Button>
          </form>
        </CardContent>
      </Card>

      {errorMessage ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}

      {replacementSelection ? (
        <Card className="ring-primary/30">
          <CardHeader>
            <CardTitle>Escolha o novo veículo principal</CardTitle>
            <CardDescription>
              O proprietário possui outros veículos ativos. Selecione o substituto
              antes de inativar {replacementSelection.vehicle.plateNormalized}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {replacementSelection.candidates.map((candidate) => (
              <button
                className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                key={candidate.id}
                onClick={() => {
                  const selection = replacementSelection;
                  setReplacementSelection(null);
                  void changeStatus(
                    selection.vehicle,
                    "INACTIVE",
                    candidate.id,
                  );
                }}
                type="button"
              >
                <span>
                  <span className="block font-medium">
                    {candidate.nickname || `${candidate.brand} ${candidate.model}`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {candidate.color} · {VEHICLE_TYPE_LABELS[candidate.type]}
                  </span>
                </span>
                <span className="font-mono text-sm">{candidate.plateNormalized}</span>
              </button>
            ))}
            <Button
              onClick={() => setReplacementSelection(null)}
              variant="outline"
            >
              Cancelar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {selectedVehicle ? <VehicleDetails vehicle={selectedVehicle} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Veículos</CardTitle>
          <CardDescription>
            {data ? `${data.meta.total} veículo(s) encontrado(s).` : "Carregando..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando veículos...
            </p>
          ) : data && data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-5xl text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Veículo</th>
                    <th className="px-3 py-3">Placa</th>
                    <th className="px-3 py-3">Proprietário</th>
                    <th className="px-3 py-3">Tipo</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-3 py-4">
                        <p className="font-medium">
                          {vehicle.nickname || `${vehicle.brand} ${vehicle.model}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.color}{vehicle.year ? ` · ${vehicle.year}` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-4 font-mono font-medium">
                        {vehicle.plateNormalized}
                      </td>
                      <td className="px-3 py-4">
                        <p>{vehicle.owner.fullName ?? "Perfil incompleto"}</p>
                        <p className="text-xs text-muted-foreground">
                          {vehicle.owner.email ?? "Sem e-mail"}
                        </p>
                      </td>
                      <td className="px-3 py-4">
                        {VEHICLE_TYPE_LABELS[vehicle.type]}
                      </td>
                      <td className="px-3 py-4">
                        <VehicleStatusBadge vehicle={vehicle} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => setSelectedVehicleId(vehicle.id)}
                            size="sm"
                            variant="outline"
                          >
                            Detalhes
                          </Button>
                          <Button
                            disabled={pendingVehicleId === vehicle.id}
                            onClick={() => void handleStatusChange(vehicle)}
                            size="sm"
                            variant={
                              vehicle.status === "ACTIVE"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {pendingVehicleId === vehicle.id
                              ? "Salvando..."
                              : vehicle.status === "ACTIVE"
                                ? "Inativar"
                                : "Reativar"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum veículo encontrado.
            </p>
          )}

          {data && data.meta.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Página {data.meta.page} de {data.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="outline"
                >
                  Próxima
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
