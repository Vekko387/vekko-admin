import "client-only";

import { apiRequest } from "@/services/api-client";
import {
  parsePartnerUnit,
  parsePartnerUnitList,
  parseServiceCatalog,
  parseServiceCatalogItem,
  type CatalogStatus,
  type PartnerUnit,
  type PartnerUnitInput,
  type PartnerUnitList,
  type ServiceCatalogItem,
  type UnitStatus,
} from "./partner-unit";

export type UnitFilters = {
  partner?: string;
  status?: UnitStatus;
  city?: string;
  state?: string;
};

const unitPath = (id: string) =>
  `/admin/partner-units/${encodeURIComponent(id)}`;
const servicePath = (id: string) => `/admin/services/${encodeURIComponent(id)}`;

export async function listAdminUnits(
  filters: UnitFilters = {},
): Promise<PartnerUnitList> {
  const search = new URLSearchParams({ limit: "100", page: "1" });
  Object.entries(filters).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return parsePartnerUnitList(
    await apiRequest<unknown>(`/admin/partner-units?${search.toString()}`),
  );
}

export async function updateAdminUnit(
  id: string,
  input: PartnerUnitInput,
): Promise<PartnerUnit> {
  return parsePartnerUnit(
    await apiRequest<unknown>(unitPath(id), {
      body: JSON.stringify(input),
      method: "PATCH",
    }),
  );
}

export async function updateAdminUnitStatus(
  id: string,
  status: UnitStatus,
): Promise<PartnerUnit> {
  return parsePartnerUnit(
    await apiRequest<unknown>(`${unitPath(id)}/status`, {
      body: JSON.stringify({ status }),
      method: "PATCH",
    }),
  );
}

export async function listServices(): Promise<ServiceCatalogItem[]> {
  return parseServiceCatalog(await apiRequest<unknown>("/admin/services"));
}

export async function createService(input: {
  code: string;
  name: string;
  description?: string;
}): Promise<ServiceCatalogItem> {
  return parseServiceCatalogItem(
    await apiRequest<unknown>("/admin/services", {
      body: JSON.stringify(input),
      method: "POST",
    }),
  );
}

export async function updateService(
  id: string,
  input: { name: string; description?: string },
): Promise<ServiceCatalogItem> {
  return parseServiceCatalogItem(
    await apiRequest<unknown>(servicePath(id), {
      body: JSON.stringify(input),
      method: "PATCH",
    }),
  );
}

export async function updateServiceStatus(
  id: string,
  status: CatalogStatus,
): Promise<ServiceCatalogItem> {
  return parseServiceCatalogItem(
    await apiRequest<unknown>(`${servicePath(id)}/status`, {
      body: JSON.stringify({ status }),
      method: "PATCH",
    }),
  );
}
