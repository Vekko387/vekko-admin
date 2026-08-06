export const PARTNER_APPLICATION_STATUSES = [
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

export type PartnerApplicationStatus = (typeof PARTNER_APPLICATION_STATUSES)[number];

export type PartnerApplication = {
  id: string;
  status: PartnerApplicationStatus;
  submittedAt: string;
  reviewDeadlineAt: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  responsibleName: string;
  responsibleCpf: string | null;
  responsiblePhone: string;
  responsibleEmail: string;
  responsibleRole: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  websiteOrInstagram: string | null;
  postalCode: string;
  street: string;
  addressNumber: string;
  addressComplement?: string;
  neighborhood: string;
  city: string;
  state: string;
  businessCategory: string;
  serviceDescription: string;
  reviewedAt?: string;
  reviewedById?: string;
  rejectionReason?: string;
  invitationSent: boolean;
};

export type PartnerApplicationList = {
  items: PartnerApplication[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export class InvalidPartnerApplicationResponseError extends Error {
  constructor() {
    super("A API retornou dados inválidos para as solicitações de parceria.");
    this.name = "InvalidPartnerApplicationResponseError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isStatus(value: unknown): value is PartnerApplicationStatus {
  return (
    typeof value === "string" &&
    PARTNER_APPLICATION_STATUSES.includes(value as PartnerApplicationStatus)
  );
}

export function parsePartnerApplication(value: unknown): PartnerApplication {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isStatus(value.status) ||
    !isString(value.submittedAt) ||
    !isString(value.reviewDeadlineAt) ||
    !isString(value.legalName) ||
    !isString(value.tradeName) ||
    !isString(value.cnpj) ||
    !isString(value.responsibleName) ||
    !isNullableString(value.responsibleCpf) ||
    !isString(value.responsiblePhone) ||
    !isString(value.responsibleEmail) ||
    !isString(value.responsibleRole) ||
    !isString(value.contactEmail) ||
    !isString(value.contactPhone) ||
    !isString(value.whatsapp) ||
    !isNullableString(value.websiteOrInstagram) ||
    !isString(value.postalCode) ||
    !isString(value.street) ||
    !isString(value.addressNumber) ||
    !isOptionalString(value.addressComplement) ||
    !isString(value.neighborhood) ||
    !isString(value.city) ||
    !isString(value.state) ||
    !isString(value.businessCategory) ||
    !isString(value.serviceDescription) ||
    !isOptionalString(value.reviewedAt) ||
    !isOptionalString(value.reviewedById) ||
    !isOptionalString(value.rejectionReason) ||
    typeof value.invitationSent !== "boolean"
  ) {
    throw new InvalidPartnerApplicationResponseError();
  }

  return {
    id: value.id,
    status: value.status,
    submittedAt: value.submittedAt,
    reviewDeadlineAt: value.reviewDeadlineAt,
    legalName: value.legalName,
    tradeName: value.tradeName,
    cnpj: value.cnpj,
    responsibleName: value.responsibleName,
    responsibleCpf: value.responsibleCpf,
    responsiblePhone: value.responsiblePhone,
    responsibleEmail: value.responsibleEmail,
    responsibleRole: value.responsibleRole,
    contactEmail: value.contactEmail,
    contactPhone: value.contactPhone,
    whatsapp: value.whatsapp,
    websiteOrInstagram: value.websiteOrInstagram,
    postalCode: value.postalCode,
    street: value.street,
    addressNumber: value.addressNumber,
    addressComplement: value.addressComplement,
    neighborhood: value.neighborhood,
    city: value.city,
    state: value.state,
    businessCategory: value.businessCategory,
    serviceDescription: value.serviceDescription,
    reviewedAt: value.reviewedAt,
    reviewedById: value.reviewedById,
    rejectionReason: value.rejectionReason,
    invitationSent: value.invitationSent,
  };
}

export function parsePartnerApplicationList(value: unknown): PartnerApplicationList {
  if (!isRecord(value) || !Array.isArray(value.items) || !isRecord(value.meta)) {
    throw new InvalidPartnerApplicationResponseError();
  }

  const { meta } = value;
  const isValidMeta =
    typeof meta.page === "number" &&
    Number.isInteger(meta.page) &&
    meta.page >= 1 &&
    typeof meta.limit === "number" &&
    Number.isInteger(meta.limit) &&
    meta.limit >= 1 &&
    typeof meta.total === "number" &&
    Number.isInteger(meta.total) &&
    meta.total >= 0 &&
    typeof meta.totalPages === "number" &&
    Number.isInteger(meta.totalPages) &&
    meta.totalPages >= 0;

  if (!isValidMeta) {
    throw new InvalidPartnerApplicationResponseError();
  }

  return {
    items: value.items.map(parsePartnerApplication),
    meta: {
      page: meta.page as number,
      limit: meta.limit as number,
      total: meta.total as number,
      totalPages: meta.totalPages as number,
    },
  };
}
