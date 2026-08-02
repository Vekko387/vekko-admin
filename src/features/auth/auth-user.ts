export const USER_ROLES = [
  "CUSTOMER",
  "PARTNER_OWNER",
  "PARTNER_MANAGER",
  "PARTNER_EMPLOYEE",
  "SUPER_ADMIN",
  "ADMIN",
  "SUPORTE",
  "FINANCEIRO",
  "COMERCIAL",
  "OPERACOES",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const INTERNAL_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SUPORTE",
  "FINANCEIRO",
  "COMERCIAL",
  "OPERACOES",
] as const satisfies readonly UserRole[];

export type InternalRole = (typeof INTERNAL_ROLES)[number];

export const PARTNER_REVIEW_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
] as const satisfies readonly InternalRole[];

export type AuthenticatedUser = {
  id: string;
  firebaseUid: string;
  email: string | null;
  profile: {
    cpfNormalized?: string;
  };
  roles: UserRole[];
};

export class InvalidAuthResponseError extends Error {
  constructor() {
    super("A API retornou uma sessão inválida.");
    this.name = "InvalidAuthResponseError";
  }
}

export class AdminAccessDeniedError extends Error {
  constructor() {
    super("Esta conta não tem acesso ao painel interno.");
    this.name = "AdminAccessDeniedError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function isInternalRole(role: UserRole): role is InternalRole {
  return (INTERNAL_ROLES as readonly UserRole[]).includes(role);
}

export function hasInternalRole(roles: readonly UserRole[]): boolean {
  return roles.some(isInternalRole);
}

export function canReviewPartnerApplications(roles: readonly UserRole[]): boolean {
  return roles.some((role) =>
    (PARTNER_REVIEW_ROLES as readonly UserRole[]).includes(role),
  );
}

export function parseAuthenticatedUser(value: unknown): AuthenticatedUser {
  if (!isRecord(value) || !isRecord(value.profile) || !Array.isArray(value.roles)) {
    throw new InvalidAuthResponseError();
  }

  const roles = value.roles;
  const profile = value.profile;
  const hasValidProfile =
    profile.cpfNormalized === undefined || typeof profile.cpfNormalized === "string";

  if (
    typeof value.id !== "string" ||
    value.id.length === 0 ||
    typeof value.firebaseUid !== "string" ||
    value.firebaseUid.length === 0 ||
    (typeof value.email !== "string" && value.email !== null) ||
    !hasValidProfile ||
    !roles.every(isUserRole)
  ) {
    throw new InvalidAuthResponseError();
  }

  return {
    id: value.id,
    firebaseUid: value.firebaseUid,
    email: value.email,
    profile:
      typeof profile.cpfNormalized === "string"
        ? { cpfNormalized: profile.cpfNormalized }
        : {},
    roles: [...roles],
  };
}
