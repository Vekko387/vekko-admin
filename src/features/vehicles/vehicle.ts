import type { PaginationMeta } from "@/features/customers/customer";

export type VehicleStatus = "ACTIVE" | "INACTIVE";
export type VehicleType = "HATCH" | "SEDAN" | "SUV" | "PICKUP";

export type AdminVehicle = {
  brand: string;
  color: string;
  createdAt: string;
  id: string;
  isPrimary: boolean;
  model: string;
  nickname: string | null;
  owner: {
    cpfNormalized: string | null;
    email: string | null;
    fullName: string | null;
    id: string;
  };
  plateNormalized: string;
  status: VehicleStatus;
  type: VehicleType;
  updatedAt: string;
  year: number | null;
};

export type AdminVehicleList = {
  items: AdminVehicle[];
  meta: PaginationMeta;
};

export type AdminVehicleFilters = {
  limit?: number;
  page?: number;
  search?: string;
  status?: VehicleStatus;
  type?: VehicleType;
  userId?: string;
};

export class InvalidVehicleResponseError extends Error {
  constructor() {
    super("A API retornou dados de veículos inválidos.");
    this.name = "InvalidVehicleResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function parseVehicle(value: unknown): AdminVehicle {
  if (!isRecord(value) || !isRecord(value.owner)) {
    throw new InvalidVehicleResponseError();
  }

  const owner = value.owner;

  if (
    typeof value.id !== "string" ||
    typeof value.brand !== "string" ||
    typeof value.color !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.isPrimary !== "boolean" ||
    typeof value.model !== "string" ||
    typeof value.plateNormalized !== "string" ||
    (value.status !== "ACTIVE" && value.status !== "INACTIVE") ||
    !["HATCH", "SEDAN", "SUV", "PICKUP"].includes(String(value.type)) ||
    typeof value.updatedAt !== "string" ||
    !isNullableString(value.nickname) ||
    (value.year !== null && typeof value.year !== "number") ||
    typeof owner.id !== "string" ||
    !isNullableString(owner.email) ||
    !isNullableString(owner.fullName) ||
    !isNullableString(owner.cpfNormalized)
  ) {
    throw new InvalidVehicleResponseError();
  }

  return {
    brand: value.brand,
    color: value.color,
    createdAt: value.createdAt,
    id: value.id,
    isPrimary: value.isPrimary,
    model: value.model,
    nickname: value.nickname,
    owner: {
      cpfNormalized: owner.cpfNormalized,
      email: owner.email,
      fullName: owner.fullName,
      id: owner.id,
    },
    plateNormalized: value.plateNormalized,
    status: value.status,
    type: value.type as VehicleType,
    updatedAt: value.updatedAt,
    year: value.year,
  };
}

export function parseAdminVehicle(value: unknown): AdminVehicle {
  return parseVehicle(value);
}

export function parseAdminVehicleList(value: unknown): AdminVehicleList {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta)) {
    throw new InvalidVehicleResponseError();
  }

  const meta = value.meta;

  if (
    typeof meta.limit !== "number" ||
    typeof meta.page !== "number" ||
    typeof meta.total !== "number" ||
    typeof meta.totalPages !== "number"
  ) {
    throw new InvalidVehicleResponseError();
  }

  return {
    items: value.items.map(parseVehicle),
    meta: {
      limit: meta.limit,
      page: meta.page,
      total: meta.total,
      totalPages: meta.totalPages,
    },
  };
}
