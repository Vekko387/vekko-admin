import { describe, expect, it } from "vitest";

import {
  canReviewPartnerApplications,
  hasInternalRole,
  InvalidAuthResponseError,
  parseAuthenticatedUser,
} from "@/features/auth/auth-user";

const validUser = {
  id: "b0b04ec7-4aa8-4f4d-b92c-09391c479aca",
  firebaseUid: "firebase-admin",
  email: "admin@vekko.test",
  profile: {},
  roles: ["ADMIN"],
};

describe("parseAuthenticatedUser", () => {
  it("valida o contrato retornado por /auth/me", () => {
    expect(parseAuthenticatedUser(validUser)).toEqual(validUser);
  });

  it("rejeita roles que não pertencem ao contrato oficial", () => {
    expect(() =>
      parseAuthenticatedUser({
        ...validUser,
        roles: ["ADMIN_FROM_FRONTEND"],
      }),
    ).toThrow(InvalidAuthResponseError);
  });

  it("rejeita respostas sem identidade local válida", () => {
    expect(() =>
      parseAuthenticatedUser({
        ...validUser,
        firebaseUid: undefined,
      }),
    ).toThrow(InvalidAuthResponseError);
  });
});

describe("autorização interna", () => {
  it("permite acesso ao painel somente para equipe interna", () => {
    expect(hasInternalRole(["ADMIN"])).toBe(true);
    expect(hasInternalRole(["SUPORTE"])).toBe(true);
    expect(hasInternalRole(["CUSTOMER"])).toBe(false);
    expect(hasInternalRole(["PARTNER_OWNER"])).toBe(false);
  });

  it("limita a análise de parceiros a ADMIN e SUPER_ADMIN", () => {
    expect(canReviewPartnerApplications(["ADMIN"])).toBe(true);
    expect(canReviewPartnerApplications(["SUPER_ADMIN"])).toBe(true);
    expect(canReviewPartnerApplications(["SUPORTE"])).toBe(false);
    expect(canReviewPartnerApplications(["OPERACOES"])).toBe(false);
  });
});
