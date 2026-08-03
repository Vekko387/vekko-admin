import "client-only";

import { apiRequest } from "@/services/api-client";

import {
  parseCustomerList,
  parseCustomerResponse,
  type Customer,
  type CustomerFilters,
  type CustomerList,
  type UserStatus,
} from "./customer";

export async function listCustomers(
  filters: CustomerFilters,
): Promise<CustomerList> {
  const query = new URLSearchParams();

  query.set("page", String(filters.page ?? 1));
  query.set("limit", String(filters.limit ?? 20));

  if (filters.search) query.set("search", filters.search);
  if (filters.status) query.set("status", filters.status);
  if (filters.profileComplete !== undefined) {
    query.set("profileComplete", String(filters.profileComplete));
  }

  const response: unknown = await apiRequest(`/admin/users?${query.toString()}`);

  return parseCustomerList(response);
}

export async function updateCustomerStatus(
  id: string,
  status: UserStatus,
): Promise<Customer> {
  const response: unknown = await apiRequest(`/admin/users/${id}/status`, {
    body: JSON.stringify({ status }),
    method: "PATCH",
  });

  return parseCustomerResponse(response);
}
