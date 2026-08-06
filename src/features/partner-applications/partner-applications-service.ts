import "client-only";

import {
  parsePartnerApplication,
  parsePartnerApplicationList,
  type PartnerApplication,
  type PartnerApplicationList,
} from "@/features/partner-applications/partner-application";
import { apiRequest } from "@/services/api-client";

const PAGE_SIZE = 20;

export async function listPendingPartnerApplications(
  page: number,
): Promise<PartnerApplicationList> {
  const query = new URLSearchParams({
    status: "PENDING_REVIEW",
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  const response = await apiRequest<unknown>(
    `/admin/partner-applications?${query.toString()}`,
  );

  return parsePartnerApplicationList(response);
}

export async function approvePartnerApplication(
  id: string,
): Promise<PartnerApplication> {
  const response = await apiRequest<unknown>(
    `/admin/partner-applications/${encodeURIComponent(id)}/approve`,
    { method: "PATCH" },
  );

  return parsePartnerApplication(response);
}

export type UpdatePartnerApplicationInput = Pick<
  PartnerApplication,
  | "addressNumber"
  | "businessCategory"
  | "city"
  | "cnpj"
  | "contactEmail"
  | "contactPhone"
  | "legalName"
  | "neighborhood"
  | "postalCode"
  | "responsibleEmail"
  | "responsibleName"
  | "responsiblePhone"
  | "responsibleRole"
  | "serviceDescription"
  | "state"
  | "street"
  | "tradeName"
  | "whatsapp"
> & {
  addressComplement: string;
  responsibleCpf: string;
  websiteOrInstagram: string;
};

export async function updatePartnerApplication(
  id: string,
  input: UpdatePartnerApplicationInput,
): Promise<PartnerApplication> {
  return parsePartnerApplication(
    await apiRequest<unknown>(
      `/admin/partner-applications/${encodeURIComponent(id)}`,
      { body: JSON.stringify(input), method: "PATCH" },
    ),
  );
}

export async function rejectPartnerApplication(
  id: string,
  reason: string,
): Promise<PartnerApplication> {
  return parsePartnerApplication(
    await apiRequest<unknown>(
      `/admin/partner-applications/${encodeURIComponent(id)}/reject`,
      { body: JSON.stringify({ reason }), method: "PATCH" },
    ),
  );
}
