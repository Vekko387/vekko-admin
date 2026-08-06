import "client-only";

import { apiRequest } from "@/services/api-client";

import {
  parseAdminPlan,
  parseAdminPlanList,
  type AdminPlan,
  type PlanStatus,
  type UpdateAdminPlanInput,
} from "./plan";

export async function listAdminPlans(): Promise<AdminPlan[]> {
  const response: unknown = await apiRequest("/admin/plans");

  return parseAdminPlanList(response);
}

export async function updateAdminPlan(
  id: string,
  input: UpdateAdminPlanInput,
): Promise<AdminPlan> {
  const response: unknown = await apiRequest(`/admin/plans/${id}`, {
    body: JSON.stringify(input),
    method: "PATCH",
  });

  return parseAdminPlan(response);
}

export async function updateAdminPlanStatus(
  id: string,
  status: PlanStatus,
): Promise<AdminPlan> {
  const response: unknown = await apiRequest(`/admin/plans/${id}/status`, {
    body: JSON.stringify({ status }),
    method: "PATCH",
  });

  return parseAdminPlan(response);
}
