import "client-only";

import { apiRequest } from "@/services/api-client";

import {
  parseAdminVehicle,
  parseAdminVehicleList,
  type AdminVehicle,
  type AdminVehicleFilters,
  type AdminVehicleList,
  type VehicleStatus,
} from "./vehicle";

export async function listAdminVehicles(
  filters: AdminVehicleFilters,
): Promise<AdminVehicleList> {
  const query = new URLSearchParams();

  query.set("page", String(filters.page ?? 1));
  query.set("limit", String(filters.limit ?? 20));

  if (filters.search) query.set("search", filters.search);
  if (filters.status) query.set("status", filters.status);
  if (filters.type) query.set("type", filters.type);
  if (filters.userId) query.set("userId", filters.userId);

  const response: unknown = await apiRequest(
    `/admin/vehicles?${query.toString()}`,
  );

  return parseAdminVehicleList(response);
}

export async function updateAdminVehicleStatus(
  id: string,
  status: VehicleStatus,
  replacementPrimaryVehicleId?: string,
): Promise<AdminVehicle> {
  const response: unknown = await apiRequest(`/admin/vehicles/${id}/status`, {
    body: JSON.stringify({
      ...(replacementPrimaryVehicleId ? { replacementPrimaryVehicleId } : {}),
      status,
    }),
    method: "PATCH",
  });

  return parseAdminVehicle(response);
}
