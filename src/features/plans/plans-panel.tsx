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
import type { VehicleType } from "@/features/vehicles/vehicle";

import {
  formatMonthlyPrice,
  formatPriceInput,
  getBenefitLabel,
  parsePriceInput,
  type AdminPlan,
  type UpdateAdminPlanInput,
} from "./plan";
import {
  listAdminPlans,
  updateAdminPlan,
  updateAdminPlanStatus,
} from "./plans-service";

const VEHICLE_TYPES = ["HATCH", "SEDAN", "SUV", "PICKUP"] as const;

const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  HATCH: "Hatch",
  PICKUP: "Pickup",
  SEDAN: "Sedan",
  SUV: "SUV",
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação com o plano.";
}

function PlanSummary({
  isBusy,
  onEdit,
  onToggleStatus,
  plan,
}: {
  isBusy: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  plan: AdminPlan;
}) {
  const eligibleTypes = plan.vehicleEligibilities
    .filter(({ allowed }) => allowed)
    .map(({ vehicleType }) => VEHICLE_TYPE_LABELS[vehicleType])
    .join(", ");

  return (
    <Card className={plan.status === "INACTIVE" ? "opacity-70" : undefined}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <Badge variant={plan.status === "ACTIVE" ? "secondary" : "outline"}>
                {plan.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <CardDescription>
              {plan.code} · posição {plan.displayOrder}
            </CardDescription>
          </div>
          <p className="text-xl font-semibold">
            {formatMonthlyPrice(plan.monthlyPriceCents)}
            <span className="text-xs font-normal text-muted-foreground">
              {" "}/ mês
            </span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">{plan.description}</p>
        <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Benefício
            </p>
            <p className="mt-1 font-medium">{getBenefitLabel(plan)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Veículos elegíveis
            </p>
            <p className="mt-1 font-medium">{eligibleTypes || "Nenhum"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={isBusy} onClick={onEdit} variant="outline">
            Editar plano
          </Button>
          <Button
            disabled={isBusy}
            onClick={onToggleStatus}
            variant={plan.status === "ACTIVE" ? "destructive" : "secondary"}
          >
            {isBusy
              ? "Salvando..."
              : plan.status === "ACTIVE"
                ? "Inativar"
                : "Ativar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanEditor({
  onCancel,
  onSaved,
  plan,
}: {
  onCancel: () => void;
  onSaved: () => Promise<void>;
  plan: AdminPlan;
}) {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [price, setPrice] = useState(formatPriceInput(plan.monthlyPriceCents));
  const [displayOrder, setDisplayOrder] = useState(plan.displayOrder);
  const [washesPerCycle, setWashesPerCycle] = useState(
    plan.benefit.washesPerCycle?.toString() ?? "",
  );
  const [eligibleVehicleTypes, setEligibleVehicleTypes] = useState<VehicleType[]>(
    plan.vehicleEligibilities
      .filter(({ allowed }) => allowed)
      .map(({ vehicleType }) => vehicleType),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isUnlimited = plan.benefit.mode === "UNLIMITED";

  const toggleVehicleType = (vehicleType: VehicleType) => {
    setEligibleVehicleTypes((current) =>
      current.includes(vehicleType)
        ? current.filter((candidate) => candidate !== vehicleType)
        : [...current, vehicleType],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const monthlyPriceCents = parsePriceInput(price);
    const parsedWashes = Number(washesPerCycle);

    if (!name.trim() || !description.trim()) {
      setErrorMessage("Informe nome e descrição do plano.");
      return;
    }

    if (monthlyPriceCents === null) {
      setErrorMessage("Informe uma mensalidade válida.");
      return;
    }

    if (!isUnlimited && (!Number.isInteger(parsedWashes) || parsedWashes < 1)) {
      setErrorMessage("Informe uma quantidade válida de lavagens por ciclo.");
      return;
    }

    const input: UpdateAdminPlanInput = {
      description: description.trim(),
      displayOrder,
      eligibleVehicleTypes,
      monthlyPriceCents,
      name: name.trim(),
      ...(!isUnlimited ? { washesPerCycle: parsedWashes } : {}),
    };

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateAdminPlan(plan.id, input);
      await onSaved();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="ring-2 ring-primary/20">
      <CardHeader>
        <CardTitle>Editar {plan.name}</CardTitle>
        <CardDescription>
          O código {plan.code} é interno e não pode ser alterado.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {errorMessage ? (
            <div
              aria-live="polite"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            >
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              Nome
              <input
                className="h-10 w-full rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring/40"
                maxLength={80}
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              Mensalidade
              <input
                className="h-10 w-full rounded-lg border bg-background px-3 font-normal outline-none focus:ring-2 focus:ring-ring/40"
                inputMode="decimal"
                onChange={(event) => setPrice(event.target.value)}
                placeholder="119,90"
                required
                value={price}
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-sm font-medium">
            Descrição
            <textarea
              className="min-h-24 w-full resize-y rounded-lg border bg-background p-3 font-normal outline-none focus:ring-2 focus:ring-ring/40"
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              required
              value={description}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1.5 text-sm font-medium">
              Ordem de exibição
              <select
                className="h-10 w-full rounded-lg border bg-background px-3 font-normal"
                onChange={(event) => setDisplayOrder(Number(event.target.value))}
                value={displayOrder}
              >
                {[1, 2, 3, 4].map((order) => (
                  <option key={order} value={order}>
                    Posição {order}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-sm font-medium">
              {isUnlimited ? "Regra do benefício" : "Lavagens por ciclo"}
              <input
                className="h-10 w-full rounded-lg border bg-background px-3 font-normal disabled:bg-muted disabled:text-muted-foreground"
                disabled={isUnlimited}
                min={1}
                onChange={(event) => setWashesPerCycle(event.target.value)}
                required={!isUnlimited}
                type={isUnlimited ? "text" : "number"}
                value={
                  isUnlimited
                    ? `Ilimitado · máximo de ${plan.benefit.maxUsesPerDay ?? 1} por dia`
                    : washesPerCycle
                }
              />
            </label>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium">Elegibilidade por veículo</legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {VEHICLE_TYPES.map((vehicleType) => {
                const basicRestriction =
                  plan.code === "BASIC" &&
                  (vehicleType === "SUV" || vehicleType === "PICKUP");

                return (
                  <label
                    className="flex items-center gap-3 rounded-lg border p-3 text-sm"
                    key={vehicleType}
                  >
                    <input
                      checked={
                        !basicRestriction &&
                        eligibleVehicleTypes.includes(vehicleType)
                      }
                      disabled={basicRestriction}
                      onChange={() => toggleVehicleType(vehicleType)}
                      type="checkbox"
                    />
                    <span>
                      {VEHICLE_TYPE_LABELS[vehicleType]}
                      {basicRestriction ? (
                        <span className="block text-xs text-destructive">
                          Bloqueado para Basic
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

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

export function PlansPanel() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);

    try {
      setPlans(await listAdminPlans());
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    void listAdminPlans()
      .then((result) => {
        if (!ignore) {
          setPlans(result);
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

  const editingPlan =
    plans.find(({ id }) => id === editingPlanId) ?? null;
  const activePlans = plans.filter(({ status }) => status === "ACTIVE");
  const inactivePlans = plans.filter(({ status }) => status === "INACTIVE");

  const handleStatusChange = async (plan: AdminPlan) => {
    const nextStatus = plan.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const verb = nextStatus === "ACTIVE" ? "ativar" : "inativar";

    if (!window.confirm(`Deseja ${verb} o plano ${plan.name}?`)) return;

    setPendingPlanId(plan.id);
    setErrorMessage(null);

    try {
      await updateAdminPlanStatus(plan.id, nextStatus);
      await load();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingPlanId(null);
    }
  };

  const renderPlan = (plan: AdminPlan) => (
    <PlanSummary
      isBusy={pendingPlanId === plan.id}
      key={plan.id}
      onEdit={() => setEditingPlanId(plan.id)}
      onToggleStatus={() => void handleStatusChange(plan)}
      plan={plan}
    />
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catálogo oficial</CardTitle>
          <CardDescription>
            O catálogo é fixo em quatro planos. Novos planos e exclusões não são
            permitidos neste bloco.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total
            </p>
            <p className="mt-1 text-2xl font-semibold">{plans.length || "—"}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Ativos no aplicativo
            </p>
            <p className="mt-1 text-2xl font-semibold">{activePlans.length}</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Inativos
            </p>
            <p className="mt-1 text-2xl font-semibold">{inactivePlans.length}</p>
          </div>
        </CardContent>
      </Card>

      {errorMessage ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <p>{errorMessage}</p>
          <Button className="mt-3" onClick={() => void load()} variant="outline">
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {editingPlan ? (
        <PlanEditor
          key={`${editingPlan.id}-${editingPlan.updatedAt}`}
          onCancel={() => setEditingPlanId(null)}
          onSaved={async () => {
            setEditingPlanId(null);
            await load();
          }}
          plan={editingPlan}
        />
      ) : null}

      {isLoading && plans.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Carregando planos...
          </CardContent>
        </Card>
      ) : null}

      {!isLoading && plans.length === 0 && !errorMessage ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum plano oficial foi encontrado. Verifique a migração da API.
          </CardContent>
        </Card>
      ) : null}

      {activePlans.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Planos ativos</h2>
            <p className="text-sm text-muted-foreground">
              Estes planos aparecem no aplicativo do cliente.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {activePlans.map(renderPlan)}
          </div>
        </section>
      ) : null}

      {inactivePlans.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Planos inativos</h2>
            <p className="text-sm text-muted-foreground">
              Permanecem no histórico, mas não aparecem no aplicativo.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {inactivePlans.map(renderPlan)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
