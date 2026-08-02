import "client-only";

import { signOut } from "firebase/auth";

import { getFirebaseAuth } from "@/config/firebase";
import { ApiError } from "@/services/api-error";

const DEFAULT_API_URL = "http://localhost:3000/api/v1";

type ApiRequestOptions = RequestInit & {
  authenticated?: boolean;
};

function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
}

async function getApiErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };

    if (typeof body.message === "string") {
      return body.message;
    }

    if (Array.isArray(body.message) && body.message.every((item) => typeof item === "string")) {
      return body.message.join(" ");
    }
  } catch {
    // A mensagem segura abaixo cobre respostas sem JSON válido.
  }

  return "Falha ao comunicar com a VEKKO API.";
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { authenticated = true, headers: customHeaders, ...init } = options;
  const headers = new Headers(customHeaders);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const auth = getFirebaseAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new ApiError(401, "Sessão Firebase não encontrada.");
    }

    const idToken = await firebaseUser.getIdToken();
    headers.set("Authorization", `Bearer ${idToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    if (authenticated && response.status === 401) {
      await signOut(getFirebaseAuth());
    }

    throw new ApiError(response.status, await getApiErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
