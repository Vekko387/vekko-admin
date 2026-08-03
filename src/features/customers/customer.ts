export type UserStatus = "ACTIVE" | "BLOCKED";

export type Customer = {
  activeVehicleCount: number;
  createdAt: string;
  email: string | null;
  id: string;
  profile: {
    complete: boolean;
    completedAt: string | null;
    cpfNormalized: string | null;
    fullName: string | null;
    phoneNormalized: string | null;
  };
  status: UserStatus;
  updatedAt: string;
};

export type PaginationMeta = {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
};

export type CustomerList = {
  items: Customer[];
  meta: PaginationMeta;
};

export type CustomerFilters = {
  limit?: number;
  page?: number;
  profileComplete?: boolean;
  search?: string;
  status?: UserStatus;
};

export class InvalidCustomerResponseError extends Error {
  constructor() {
    super("A API retornou dados de clientes inválidos.");
    this.name = "InvalidCustomerResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function parseCustomer(value: unknown): Customer {
  if (!isRecord(value) || !isRecord(value.profile)) {
    throw new InvalidCustomerResponseError();
  }

  const profile = value.profile;

  if (
    typeof value.id !== "string" ||
    !isNullableString(value.email) ||
    (value.status !== "ACTIVE" && value.status !== "BLOCKED") ||
    typeof value.activeVehicleCount !== "number" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    typeof profile.complete !== "boolean" ||
    !isNullableString(profile.completedAt) ||
    !isNullableString(profile.cpfNormalized) ||
    !isNullableString(profile.fullName) ||
    !isNullableString(profile.phoneNormalized)
  ) {
    throw new InvalidCustomerResponseError();
  }

  return {
    activeVehicleCount: value.activeVehicleCount,
    createdAt: value.createdAt,
    email: value.email,
    id: value.id,
    profile: {
      complete: profile.complete,
      completedAt: profile.completedAt,
      cpfNormalized: profile.cpfNormalized,
      fullName: profile.fullName,
      phoneNormalized: profile.phoneNormalized,
    },
    status: value.status,
    updatedAt: value.updatedAt,
  };
}

function parseMeta(value: unknown): PaginationMeta {
  if (
    !isRecord(value) ||
    typeof value.limit !== "number" ||
    typeof value.page !== "number" ||
    typeof value.total !== "number" ||
    typeof value.totalPages !== "number"
  ) {
    throw new InvalidCustomerResponseError();
  }

  return {
    limit: value.limit,
    page: value.page,
    total: value.total,
    totalPages: value.totalPages,
  };
}

export function parseCustomerResponse(value: unknown): Customer {
  return parseCustomer(value);
}

export function parseCustomerList(value: unknown): CustomerList {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new InvalidCustomerResponseError();
  }

  return {
    items: value.items.map(parseCustomer),
    meta: parseMeta(value.meta),
  };
}
