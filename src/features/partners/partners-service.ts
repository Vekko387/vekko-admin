import "client-only";

import {
  parsePartner,
  parsePartnerList,
  type Partner,
  type PartnerList,
  type PartnerStatus,
  type UpdatePartnerInput,
} from "@/features/partners/partner";
import { apiRequest } from "@/services/api-client";

export async function listPartners(): Promise<PartnerList> {
  return parsePartnerList(
    await apiRequest<unknown>("/admin/partners?page=1&limit=100"),
  );
}

export async function updatePartner(
  id: string,
  input: UpdatePartnerInput,
): Promise<Partner> {
  return parsePartner(
    await apiRequest<unknown>(`/admin/partners/${encodeURIComponent(id)}`, {
      body: JSON.stringify(input),
      method: "PATCH",
    }),
  );
}

export async function updatePartnerStatus(
  id: string,
  status: PartnerStatus,
): Promise<Partner> {
  return parsePartner(
    await apiRequest<unknown>(
      `/admin/partners/${encodeURIComponent(id)}/status`,
      { body: JSON.stringify({ status }), method: "PATCH" },
    ),
  );
}
