"use client";

import {
  Ban,
  CheckCircle2,
  LoaderCircle,
  MapPin,
  Pencil,
  RefreshCw,
} from "lucide-react";
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
  listAdminUnits,
  updateAdminUnit,
  updateAdminUnitStatus,
  type UnitFilters,
} from "./partner-units-service";
import {
  UNIT_STATUSES,
  type PartnerUnit,
  type PartnerUnitInput,
  type UnitStatus,
} from "./partner-unit";

const inputClassName =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:bg-muted";
const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const STATUS_LABELS: Record<UnitStatus, string> = {
  ACTIVE: "Ativa",
  DRAFT: "Incompleta",
  INACTIVE: "Inativa",
  SUSPENDED: "Suspensa",
};
const REQUIREMENT_LABELS: Record<string, string> = {
  BUSINESS_HOURS: "horários dos sete dias",
  LOCATION: "localização válida",
  PLAN: "plano aceito",
  SERVICE: "serviço disponível",
  VEHICLE_TYPE: "tipo de veículo",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação administrativa.";
}

function readString(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readUnitInput(data: FormData): PartnerUnitInput {
  const addressComplement = readString(data, "addressComplement");
  const whatsapp = readString(data, "whatsapp");
  return {
    addressComplement,
    addressNumber: readString(data, "addressNumber"),
    city: readString(data, "city"),
    name: readString(data, "name"),
    neighborhood: readString(data, "neighborhood"),
    phone: readString(data, "phone"),
    postalCode: readString(data, "postalCode"),
    state: readString(data, "state").toUpperCase(),
    street: readString(data, "street"),
    whatsapp,
  };
}

function UnitEditor({
  onCancel,
  onSaved,
  unit,
}: {
  onCancel: () => void;
  onSaved: (unit: PartnerUnit) => void;
  unit: PartnerUnit;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      onSaved(
        await updateAdminUnit(
          unit.id,
          readUnitInput(new FormData(event.currentTarget)),
        ),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  const field = (
    name: keyof PartnerUnitInput,
    label: string,
    props: React.ComponentProps<"input"> = {},
  ) => (
    <label className="space-y-1.5 text-sm font-medium">
      {label}
      <input
        {...props}
        className={inputClassName}
        defaultValue={unit[name] ?? ""}
        disabled={isSaving}
        name={name}
      />
    </label>
  );

  return (
    <Card className="ring-2 ring-primary/15">
      <CardHeader>
        <CardTitle>Editar {unit.name}</CardTitle>
        <CardDescription>
          Alterações no endereço geram uma nova tentativa de geocodificação.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {errorMessage ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            {field("name", "Nome", { maxLength: 160, required: true })}
            {field("phone", "Telefone", { maxLength: 20, required: true })}
            {field("whatsapp", "WhatsApp", { maxLength: 20 })}
            {field("postalCode", "CEP", { maxLength: 9, required: true })}
            {field("street", "Rua", { maxLength: 160, required: true })}
            {field("addressNumber", "Número", {
              maxLength: 30,
              required: true,
            })}
            {field("addressComplement", "Complemento", { maxLength: 120 })}
            {field("neighborhood", "Bairro", {
              maxLength: 120,
              required: true,
            })}
            {field("city", "Cidade", { maxLength: 120, required: true })}
            {field("state", "Estado (UF)", {
              maxLength: 2,
              minLength: 2,
              required: true,
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Salvando..." : "Salvar alterações"}
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

function UnitDetail({
  isBusy,
  onEdit,
  onStatus,
  unit,
}: {
  isBusy: boolean;
  onEdit: () => void;
  onStatus: (status: UnitStatus) => void;
  unit: PartnerUnit;
}) {
  const selectedServices = unit.configuration.services.filter(
    (item) => item.selected,
  );
  const selectedVehicles = unit.configuration.vehicleTypes.filter(
    (item) => item.selected,
  );
  const selectedPlans = unit.configuration.plans.filter(
    (item) => item.selected,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">{unit.name}</CardTitle>
              <Badge
                variant={
                  unit.status === "SUSPENDED"
                    ? "destructive"
                    : unit.status === "ACTIVE"
                      ? "secondary"
                      : "outline"
                }
              >
                {STATUS_LABELS[unit.status]}
              </Badge>
            </div>
            <CardDescription>{unit.partner.tradeName}</CardDescription>
          </div>
          <Button disabled={isBusy} onClick={onEdit} variant="outline">
            <Pencil aria-hidden="true" /> Editar dados
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Endereço
            </p>
            <p className="mt-2">
              {unit.formattedAddress ?? `${unit.street}, ${unit.addressNumber}`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {unit.phone}
              {unit.whatsapp ? ` · WhatsApp ${unit.whatsapp}` : ""}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Localização
            </p>
            {unit.latitude !== null && unit.longitude !== null ? (
              <p className="mt-2 flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {unit.latitude.toFixed(6)}, {unit.longitude.toFixed(6)}
              </p>
            ) : (
              <p className="mt-2 text-amber-700">
                Geocodificação pendente ou inválida.
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {unit.mapProviderId ?? "Sem identificador do provedor"}
            </p>
          </div>
        </div>

        {!unit.isComplete ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="font-medium">Configuração incompleta</p>
            <p className="mt-1 text-muted-foreground">
              {unit.missingRequirements
                .map((item) => REQUIREMENT_LABELS[item] ?? item)
                .join(", ")}
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="font-medium">Horários</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {unit.configuration.businessHours.map((hour) => (
                <p className="text-sm" key={hour.dayOfWeek}>
                  <span className="font-medium">
                    {DAY_LABELS[hour.dayOfWeek]}:
                  </span>{" "}
                  {hour.isClosed
                    ? "Fechado"
                    : `${hour.opensAt ?? "—"}–${hour.closesAt ?? "—"}`}
                </p>
              ))}
              {unit.configuration.businessHours.length === 0 ? (
                <p className="text-sm text-muted-foreground">Não configurado</p>
              ) : null}
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">Operação aceita</p>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Serviços</dt>
                <dd>
                  {selectedServices.map((item) => item.name).join(", ") ||
                    "Nenhum"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Veículos</dt>
                <dd>
                  {selectedVehicles.map((item) => item.type).join(", ") ||
                    "Nenhum"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Planos</dt>
                <dd>
                  {selectedPlans.map((item) => item.name).join(", ") ||
                    "Nenhum"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t pt-5">
          <Button
            disabled={isBusy || !unit.isComplete || unit.status === "ACTIVE"}
            onClick={() => onStatus("ACTIVE")}
            variant="secondary"
          >
            <CheckCircle2 aria-hidden="true" /> Ativar
          </Button>
          <Button
            disabled={isBusy || unit.status === "INACTIVE"}
            onClick={() => onStatus("INACTIVE")}
            variant="outline"
          >
            Inativar
          </Button>
          <Button
            disabled={isBusy || unit.status === "SUSPENDED"}
            onClick={() => onStatus("SUSPENDED")}
            variant="destructive"
          >
            <Ban aria-hidden="true" /> Suspender
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminUnitsPanel() {
  const [units, setUnits] = useState<PartnerUnit[]>([]);
  const [filters, setFilters] = useState<UnitFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingStatus, setPendingStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(
    async (nextFilters: UnitFilters, preferredId?: string) => {
      setIsLoading(true);
      try {
        const response = await listAdminUnits(nextFilters);
        setUnits(response.items);
        setSelectedId((current) => {
          const requested = preferredId ?? current;
          return response.items.some((unit) => unit.id === requested)
            ? requested
            : (response.items[0]?.id ?? null);
        });
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    let ignore = false;
    void listAdminUnits()
      .then((response) => {
        if (!ignore) {
          setUnits(response.items);
          setSelectedId(response.items[0]?.id ?? null);
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

  const selectedUnit = units.find((unit) => unit.id === selectedId) ?? null;

  async function handleFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextFilters: UnitFilters = {
      partner: readString(data, "partner") || undefined,
      city: readString(data, "city") || undefined,
      state: readString(data, "state").toUpperCase() || undefined,
      status: (readString(data, "status") as UnitStatus) || undefined,
    };
    setFilters(nextFilters);
    setEditing(false);
    await load(nextFilters);
  }

  async function handleStatus(status: UnitStatus) {
    if (!selectedUnit || status === "DRAFT") return;
    const action =
      status === "ACTIVE"
        ? "ativar"
        : status === "INACTIVE"
          ? "inativar"
          : "suspender";
    if (!window.confirm(`Deseja ${action} a unidade ${selectedUnit.name}?`))
      return;

    setPendingStatus(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await updateAdminUnitStatus(selectedUnit.id, status);
      await load(filters, selectedUnit.id);
      setSuccessMessage(
        `Status de ${selectedUnit.name} atualizado com sucesso.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingStatus(false);
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="units-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold" id="units-title">
              Unidades parceiras
            </h2>
            <Badge variant="secondary">{units.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Consulte e controle todos os locais operacionais da rede.
          </p>
        </div>
        <Button
          disabled={isLoading}
          onClick={() => void load(filters)}
          variant="outline"
        >
          <RefreshCw
            className={isLoading ? "animate-spin" : undefined}
            aria-hidden="true"
          />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-5" onSubmit={handleFilter}>
            <input
              className={inputClassName}
              name="partner"
              placeholder="Parceiro ou CNPJ"
            />
            <select className={inputClassName} name="status" defaultValue="">
              <option value="">Todos os status</option>
              {UNIT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <input
              className={inputClassName}
              name="city"
              placeholder="Cidade"
            />
            <input
              className={inputClassName}
              maxLength={2}
              name="state"
              placeholder="UF"
            />
            <Button type="submit">Filtrar unidades</Button>
          </form>
        </CardContent>
      </Card>

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

      {isLoading && units.length === 0 ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <LoaderCircle className="animate-spin" aria-hidden="true" />{" "}
          Carregando unidades...
        </div>
      ) : null}
      {!isLoading && units.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma unidade corresponde aos filtros.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {units.map((unit) => (
          <button
            className={`rounded-xl text-left ring-2 transition ${selectedId === unit.id ? "ring-primary/40" : "ring-transparent hover:ring-foreground/15"}`}
            key={unit.id}
            onClick={() => {
              setSelectedId(unit.id);
              setEditing(false);
            }}
            type="button"
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{unit.name}</CardTitle>
                    <CardDescription>{unit.partner.tradeName}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      unit.status === "SUSPENDED"
                        ? "destructive"
                        : unit.status === "ACTIVE"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {STATUS_LABELS[unit.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {unit.city}/{unit.state} ·{" "}
                {unit.isComplete ? "Completa" : "Incompleta"}
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      {selectedUnit ? (
        <div className="space-y-5">
          {editing ? (
            <UnitEditor
              key={selectedUnit.updatedAt}
              onCancel={() => setEditing(false)}
              onSaved={(updated) => {
                setUnits((current) =>
                  current.map((unit) =>
                    unit.id === updated.id ? updated : unit,
                  ),
                );
                setEditing(false);
                setSuccessMessage("Dados da unidade atualizados com sucesso.");
              }}
              unit={selectedUnit}
            />
          ) : null}
          <UnitDetail
            isBusy={pendingStatus}
            onEdit={() => setEditing(true)}
            onStatus={(status) => void handleStatus(status)}
            unit={selectedUnit}
          />
        </div>
      ) : null}
    </section>
  );
}
