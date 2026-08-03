import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "@/services/api-client";
import { ApiError } from "@/services/api-error";

const { getFirebaseAuthMock, signOutMock } = vi.hoisted(() => ({
  getFirebaseAuthMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock("@/config/firebase", () => ({
  getFirebaseAuth: getFirebaseAuthMock,
}));

vi.mock("firebase/auth", () => ({
  signOut: signOutMock,
}));

describe("apiRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = "https://api-staging.vekko.test/api/v1/";
    getFirebaseAuthMock.mockReturnValue({
      currentUser: {
        getIdToken: vi.fn().mockResolvedValue("firebase-id-token"),
      },
    });
  });

  it("envia o Firebase ID Token como Bearer para a API", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "local-user" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest<{ id: string }>("/auth/me")).resolves.toEqual({
      id: "local-user",
    });

    const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(request.headers);
    expect(url).toBe("https://api-staging.vekko.test/api/v1/auth/me");
    expect(headers.get("Authorization")).toBe("Bearer firebase-id-token");
  });

  it("encerra a sessão Firebase quando a API retorna 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(apiRequest("/auth/me")).rejects.toBeInstanceOf(ApiError);
    expect(signOutMock).toHaveBeenCalledOnce();
  });

  it("preserva o codigo de dominio e encerra a sessao de uma conta bloqueada", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "ACCOUNT_BLOCKED",
            message: "Esta conta esta bloqueada.",
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          },
        ),
      ),
    );

    const request = apiRequest("/admin/users");

    await expect(request).rejects.toMatchObject({
      code: "ACCOUNT_BLOCKED",
      message: "Esta conta esta bloqueada.",
      status: 403,
    });
    expect(signOutMock).toHaveBeenCalledOnce();
  });

  it("não adiciona Content-Type em um PATCH sem corpo", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/admin/partner-applications/id/approve", { method: "PATCH" });

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(request.headers).has("Content-Type")).toBe(false);
  });
});
