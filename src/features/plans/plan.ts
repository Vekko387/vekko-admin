import type { VehicleType } from "@/features/vehicles/vehicle";

export type PlanCode = "BASIC" | "ESSENTIAL" | "PREMIUM" | "UNLIMITED";
export type PlanStatus = "ACTIVE" | "INACTIVE";
export type PlanBenefitMode = "LIMITED" | "UNLIMITED";

export type AdminPlan = {
  benefit: {
    maxUsesPerDay: number | null;
    mode: PlanBenefitMode;
    washesPerCycle: number | null;
  };
  code: PlanCode;
  createdAt: string;
  description: string;
  displayOrder: number;
  id: string;
  monthlyPriceCents: number;
  name: string;
  status: PlanStatus;
  updatedAt: string;
  vehicleEligibilities: Array<{
    allowed: boolean;
    vehicleType: VehicleType;
  }>;
};

export type UpdateAdminPlanInput = {
  description?: string;
  displayOrder?: number;
  eligibleVehicleTypes?: VehicleType[];
  monthlyPriceCents?: number;
  name?: string;
  washesPerCycle?: number;
};

export class InvalidPlanResponseError extends Error {
  constructor() {
    super("A API retornou dados de planos inválidos.");
    this.name = "InvalidPlanResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

function isPlanCode(value: unknown): value is PlanCode {
  return ["BASIC", "ESSENTIAL", "PREMIUM", "UNLIMITED"].includes(
    String(value),
  );
}

function isVehicleType(value: unknown): value is VehicleType {
  return ["HATCH", "SEDAN", "SUV", "PICKUP"].includes(String(value));
}

export function parseAdminPlan(value: unknown): AdminPlan {
  if (
    !isRecord(value) ||
    !isRecord(value.benefit) ||
    !Array.isArray(value.vehicleEligibilities)
  ) {
    throw new InvalidPlanResponseError();
  }

  const benefit = value.benefit;
  const vehicleEligibilities = value.vehicleEligibilities.map((eligibility) => {
    if (
      !isRecord(eligibility) ||
      typeof eligibility.allowed !== "boolean" ||
      !isVehicleType(eligibility.vehicleType)
    ) {
      throw new InvalidPlanResponseError();
    }

    return {
      allowed: eligibility.allowed,
      vehicleType: eligibility.vehicleType,
    };
  });

  if (
    typeof value.id !== "string" ||
    !isPlanCode(value.code) ||
    typeof value.createdAt !== "string" ||
    typeof value.description !== "string" ||
    typeof value.displayOrder !== "number" ||
    typeof value.monthlyPriceCents !== "number" ||
    typeof value.name !== "string" ||
    (value.status !== "ACTIVE" && value.status !== "INACTIVE") ||
    typeof value.updatedAt !== "string" ||
    (benefit.mode !== "LIMITED" && benefit.mode !== "UNLIMITED") ||
    !isNullableNumber(benefit.washesPerCycle) ||
    !isNullableNumber(benefit.maxUsesPerDay)
  ) {
    throw new InvalidPlanResponseError();
  }

  return {
    benefit: {
      maxUsesPerDay: benefit.maxUsesPerDay,
      mode: benefit.mode,
      washesPerCycle: benefit.washesPerCycle,
    },
    code: value.code,
    createdAt: value.createdAt,
    description: value.description,
    displayOrder: value.displayOrder,
    id: value.id,
    monthlyPriceCents: value.monthlyPriceCents,
    name: value.name,
    status: value.status,
    updatedAt: value.updatedAt,
    vehicleEligibilities,
  };
}

export function parseAdminPlanList(value: unknown): AdminPlan[] {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new InvalidPlanResponseError();
  }

  return value.items.map(parseAdminPlan);
}

export function formatMonthlyPrice(monthlyPriceCents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(monthlyPriceCents / 100);
}

export function formatPriceInput(monthlyPriceCents: number): string {
  return (monthlyPriceCents / 100).toFixed(2).replace(".", ",");
}

export function parsePriceInput(value: string): number | null {
  const sanitized = value.trim().replace(/\s|R\$/gu, "");
  const normalized = sanitized.includes(",")
    ? sanitized.replace(/\./gu, "").replace(",", ".")
    : sanitized;
  const amount = Number(normalized);

  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(amount * 100);
}

export function getBenefitLabel(plan: AdminPlan): string {
  if (plan.benefit.mode === "UNLIMITED") {
    return `Ilimitado · máximo de ${plan.benefit.maxUsesPerDay ?? 1} por dia`;
  }

  return `${plan.benefit.washesPerCycle ?? 0} lavagens por ciclo`;
}
