import "client-only";

import {
  AdminAccessDeniedError,
  hasInternalRole,
  InvalidAuthResponseError,
  parseAuthenticatedUser,
  type AuthenticatedUser,
} from "@/features/auth/auth-user";
import { apiRequest } from "@/services/api-client";

export async function loadAdminSession(
  expectedFirebaseUid: string,
): Promise<AuthenticatedUser> {
  const response = await apiRequest<unknown>("/auth/me");
  const user = parseAuthenticatedUser(response);

  if (user.firebaseUid !== expectedFirebaseUid) {
    throw new InvalidAuthResponseError();
  }

  if (!hasInternalRole(user.roles)) {
    throw new AdminAccessDeniedError();
  }

  return user;
}
