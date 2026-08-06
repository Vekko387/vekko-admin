export const UNIT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
] as const;
export const VEHICLE_TYPES = ["HATCH", "SEDAN", "SUV", "PICKUP"] as const;

export type UnitStatus = (typeof UNIT_STATUSES)[number];
export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type CatalogStatus = "ACTIVE" | "INACTIVE";

export type PartnerUnit = {
  id: string;
  partnerId: string;
  partner: { id: string; tradeName: string; status: string };
  name: string;
  postalCode: string;
  street: string;
  addressNumber: string;
  addressComplement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  formattedAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  mapProviderId: string | null;
  lastGeocodedAt: string | null;
  phone: string;
  whatsapp: string | null;
  status: UnitStatus;
  isComplete: boolean;
  missingRequirements: string[];
  configuration: {
    businessHours: Array<{
      dayOfWeek: number;
      opensAt: string | null;
      closesAt: string | null;
      isClosed: boolean;
    }>;
    services: Array<{
      id: string;
      code: string;
      name: string;
      description: string | null;
      status: CatalogStatus;
      selected: boolean;
    }>;
    vehicleTypes: Array<{ type: VehicleType; selected: boolean }>;
    plans: Array<{
      id: string;
      code: string;
      name: string;
      status: CatalogStatus;
      selected: boolean;
    }>;
  };
  createdAt: string;
  updatedAt: string;
};

export type PartnerUnitInput = {
  name: string;
  postalCode: string;
  street: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
  whatsapp?: string;
};

export type PartnerUnitList = {
  items: PartnerUnit[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type ServiceCatalogItem = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: CatalogStatus;
  createdAt: string;
  updatedAt: string;
};

export class InvalidPartnerUnitResponseError extends Error {
  constructor() {
    super("A API retornou dados inválidos para as unidades.");
    this.name = "InvalidPartnerUnitResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || isString(value);
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || typeof value === "number";
}

function isCatalogStatus(value: unknown): value is CatalogStatus {
  return value === "ACTIVE" || value === "INACTIVE";
}

function isUnitStatus(value: unknown): value is UnitStatus {
  return isString(value) && UNIT_STATUSES.includes(value as UnitStatus);
}

function parseConfiguration(value: unknown): PartnerUnit["configuration"] {
  if (
    !isRecord(value) ||
    !Array.isArray(value.businessHours) ||
    !Array.isArray(value.services) ||
    !Array.isArray(value.vehicleTypes) ||
    !Array.isArray(value.plans)
  ) {
    throw new InvalidPartnerUnitResponseError();
  }

  const businessHours = value.businessHours.map((hour) => {
    if (
      !isRecord(hour) ||
      typeof hour.dayOfWeek !== "number" ||
      !isNullableString(hour.opensAt) ||
      !isNullableString(hour.closesAt) ||
      typeof hour.isClosed !== "boolean"
    ) {
      throw new InvalidPartnerUnitResponseError();
    }
    return {
      closesAt: hour.closesAt,
      dayOfWeek: hour.dayOfWeek,
      isClosed: hour.isClosed,
      opensAt: hour.opensAt,
    };
  });

  const services = value.services.map((service) => {
    if (
      !isRecord(service) ||
      !isString(service.id) ||
      !isString(service.code) ||
      !isString(service.name) ||
      !isNullableString(service.description) ||
      !isCatalogStatus(service.status) ||
      typeof service.selected !== "boolean"
    ) {
      throw new InvalidPartnerUnitResponseError();
    }
    return {
      code: service.code,
      description: service.description,
      id: service.id,
      name: service.name,
      selected: service.selected,
      status: service.status,
    };
  });

  const vehicleTypes = value.vehicleTypes.map((item) => {
    if (
      !isRecord(item) ||
      !isString(item.type) ||
      !VEHICLE_TYPES.includes(item.type as VehicleType) ||
      typeof item.selected !== "boolean"
    ) {
      throw new InvalidPartnerUnitResponseError();
    }
    return { selected: item.selected, type: item.type as VehicleType };
  });

  const plans = value.plans.map((plan) => {
    if (
      !isRecord(plan) ||
      !isString(plan.id) ||
      !isString(plan.code) ||
      !isString(plan.name) ||
      !isCatalogStatus(plan.status) ||
      typeof plan.selected !== "boolean"
    ) {
      throw new InvalidPartnerUnitResponseError();
    }
    return {
      code: plan.code,
      id: plan.id,
      name: plan.name,
      selected: plan.selected,
      status: plan.status,
    };
  });

  return { businessHours, plans, services, vehicleTypes };
}

export function parsePartnerUnit(value: unknown): PartnerUnit {
  if (
    !isRecord(value) ||
    !isRecord(value.partner) ||
    !isString(value.partner.id) ||
    !isString(value.partner.tradeName) ||
    !isString(value.partner.status) ||
    !isString(value.id) ||
    !isString(value.partnerId) ||
    !isString(value.name) ||
    !isString(value.postalCode) ||
    !isString(value.street) ||
    !isString(value.addressNumber) ||
    !isNullableString(value.addressComplement) ||
    !isString(value.neighborhood) ||
    !isString(value.city) ||
    !isString(value.state) ||
    !isNullableString(value.formattedAddress) ||
    !isNullableNumber(value.latitude) ||
    !isNullableNumber(value.longitude) ||
    !isNullableString(value.mapProviderId) ||
    !isNullableString(value.lastGeocodedAt) ||
    !isString(value.phone) ||
    !isNullableString(value.whatsapp) ||
    !isUnitStatus(value.status) ||
    typeof value.isComplete !== "boolean" ||
    !Array.isArray(value.missingRequirements) ||
    !value.missingRequirements.every(isString) ||
    !isString(value.createdAt) ||
    !isString(value.updatedAt)
  ) {
    throw new InvalidPartnerUnitResponseError();
  }

  return {
    addressComplement: value.addressComplement,
    addressNumber: value.addressNumber,
    city: value.city,
    configuration: parseConfiguration(value.configuration),
    createdAt: value.createdAt,
    formattedAddress: value.formattedAddress,
    id: value.id,
    isComplete: value.isComplete,
    lastGeocodedAt: value.lastGeocodedAt,
    latitude: value.latitude,
    longitude: value.longitude,
    mapProviderId: value.mapProviderId,
    missingRequirements: [...value.missingRequirements],
    name: value.name,
    neighborhood: value.neighborhood,
    partner: {
      id: value.partner.id,
      status: value.partner.status,
      tradeName: value.partner.tradeName,
    },
    partnerId: value.partnerId,
    phone: value.phone,
    postalCode: value.postalCode,
    state: value.state,
    status: value.status,
    street: value.street,
    updatedAt: value.updatedAt,
    whatsapp: value.whatsapp,
  };
}

export function parsePartnerUnitList(value: unknown): PartnerUnitList {
  if (
    !isRecord(value) ||
    !Array.isArray(value.items) ||
    !isRecord(value.meta)
  ) {
    throw new InvalidPartnerUnitResponseError();
  }

  const { meta } = value;
  if (
    typeof meta.page !== "number" ||
    typeof meta.limit !== "number" ||
    typeof meta.total !== "number" ||
    typeof meta.totalPages !== "number"
  ) {
    throw new InvalidPartnerUnitResponseError();
  }

  return {
    items: value.items.map(parsePartnerUnit),
    meta: {
      limit: meta.limit,
      page: meta.page,
      total: meta.total,
      totalPages: meta.totalPages,
    },
  };
}

export function parseServiceCatalogItem(value: unknown): ServiceCatalogItem {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.code) ||
    !isString(value.name) ||
    !isNullableString(value.description) ||
    !isCatalogStatus(value.status) ||
    !isString(value.createdAt) ||
    !isString(value.updatedAt)
  ) {
    throw new InvalidPartnerUnitResponseError();
  }
  return {
    code: value.code,
    createdAt: value.createdAt,
    description: value.description,
    id: value.id,
    name: value.name,
    status: value.status,
    updatedAt: value.updatedAt,
  };
}

export function parseServiceCatalog(value: unknown): ServiceCatalogItem[] {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new InvalidPartnerUnitResponseError();
  }
  return value.items.map(parseServiceCatalogItem);
}
