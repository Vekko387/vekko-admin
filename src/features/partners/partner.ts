export const PARTNER_PHOTO_TYPES = ["LOGO", "FACADE", "SERVICE_AREA"] as const;

export type PartnerPhotoType = (typeof PARTNER_PHOTO_TYPES)[number];
export type PartnerStatus = "ACTIVE" | "SUSPENDED";

export type Partner = {
  id: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  businessCategory: string;
  description: string;
  websiteOrInstagram: string | null;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  responsibleName: string;
  responsibleCpf: string | null;
  responsiblePhone: string;
  responsibleEmail: string;
  responsibleRole: string;
  postalCode: string;
  street: string;
  addressNumber: string;
  addressComplement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  status: PartnerStatus;
  photos: Array<{ type: PartnerPhotoType; url: string; updatedAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type PartnerList = {
  items: Partner[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

export type UpdatePartnerInput = {
  legalName: string;
  tradeName: string;
  businessCategory: string;
  serviceDescription: string;
  websiteOrInstagram: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  responsibleName: string;
  responsibleCpf?: string;
  responsiblePhone: string;
  responsibleEmail: string;
  responsibleRole: string;
  postalCode: string;
  street: string;
  addressNumber: string;
  addressComplement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export class InvalidPartnerResponseError extends Error {
  constructor() {
    super("A API retornou dados inválidos para os parceiros.");
    this.name = "InvalidPartnerResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isPhotoType(value: unknown): value is PartnerPhotoType {
  return typeof value === "string" && PARTNER_PHOTO_TYPES.includes(value as PartnerPhotoType);
}

export function parsePartner(value: unknown): Partner {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.legalName) ||
    !isString(value.tradeName) ||
    !isString(value.cnpj) ||
    !isString(value.businessCategory) ||
    !isString(value.description) ||
    !isNullableString(value.websiteOrInstagram) ||
    !isString(value.contactEmail) ||
    !isString(value.contactPhone) ||
    !isString(value.whatsapp) ||
    !isString(value.responsibleName) ||
    !isNullableString(value.responsibleCpf) ||
    !isString(value.responsiblePhone) ||
    !isString(value.responsibleEmail) ||
    !isString(value.responsibleRole) ||
    !isString(value.postalCode) ||
    !isString(value.street) ||
    !isString(value.addressNumber) ||
    !isNullableString(value.addressComplement) ||
    !isString(value.neighborhood) ||
    !isString(value.city) ||
    !isString(value.state) ||
    (value.status !== "ACTIVE" && value.status !== "SUSPENDED") ||
    !Array.isArray(value.photos) ||
    !isString(value.createdAt) ||
    !isString(value.updatedAt)
  ) {
    throw new InvalidPartnerResponseError();
  }

  const photos = value.photos.map((photo) => {
    if (
      !isRecord(photo) ||
      !isPhotoType(photo.type) ||
      !isString(photo.url) ||
      !isString(photo.updatedAt)
    ) {
      throw new InvalidPartnerResponseError();
    }

    return { type: photo.type, updatedAt: photo.updatedAt, url: photo.url };
  });

  return {
    addressComplement: value.addressComplement,
    addressNumber: value.addressNumber,
    businessCategory: value.businessCategory,
    city: value.city,
    cnpj: value.cnpj,
    contactEmail: value.contactEmail,
    contactPhone: value.contactPhone,
    createdAt: value.createdAt,
    description: value.description,
    id: value.id,
    legalName: value.legalName,
    neighborhood: value.neighborhood,
    photos,
    postalCode: value.postalCode,
    responsibleCpf: value.responsibleCpf,
    responsibleEmail: value.responsibleEmail,
    responsibleName: value.responsibleName,
    responsiblePhone: value.responsiblePhone,
    responsibleRole: value.responsibleRole,
    state: value.state,
    status: value.status,
    street: value.street,
    tradeName: value.tradeName,
    updatedAt: value.updatedAt,
    websiteOrInstagram: value.websiteOrInstagram,
    whatsapp: value.whatsapp,
  };
}

export function parsePartnerList(value: unknown): PartnerList {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta)) {
    throw new InvalidPartnerResponseError();
  }

  const { meta } = value;

  if (
    typeof meta.page !== "number" ||
    typeof meta.limit !== "number" ||
    typeof meta.total !== "number" ||
    typeof meta.totalPages !== "number"
  ) {
    throw new InvalidPartnerResponseError();
  }

  return {
    items: value.items.map(parsePartner),
    meta: {
      limit: meta.limit,
      page: meta.page,
      total: meta.total,
      totalPages: meta.totalPages,
    },
  };
}
