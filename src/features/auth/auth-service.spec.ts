import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadAdminSession } from "@/features/auth/auth-service";
import {
  AdminAccessDeniedError,
  InvalidAuthResponseError,
} from "@/features/auth/auth-user";
import { apiRequest } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiRequest: vi.fn(),
}));

const apiRequestMock = vi.mocked(apiRequest);

const adminUser = {
  id: "b0b04ec7-4aa8-4f4d-b92c-09391c479aca",
  firebaseUid: "firebase-admin",
  email: "admin@vekko.test",
  profile: {},
  roles: ["ADMIN"],
};

describe("loadAdminSession", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it("carrega o usuário e as roles locais por /auth/me", async () => {
    apiRequestMock.mockResolvedValue(adminUser);

    await expect(loadAdminSession("firebase-admin")).resolves.toEqual(adminUser);
    expect(apiRequestMock).toHaveBeenCalledWith("/auth/me");
  });

  it("rejeita uma resposta vinculada a outro Firebase UID", async () => {
    apiRequestMock.mockResolvedValue(adminUser);

    await expect(loadAdminSession("another-firebase-user")).rejects.toBeInstanceOf(
      InvalidAuthResponseError,
    );
  });

  it("rejeita clientes e parceiros no painel interno", async () => {
    apiRequestMock.mockResolvedValue({
      ...adminUser,
      roles: ["PARTNER_OWNER"],
    });

    await expect(loadAdminSession("firebase-admin")).rejects.toBeInstanceOf(
      AdminAccessDeniedError,
    );
  });
});
