import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  approvePartnerApplication,
  listPendingPartnerApplications,
} from "@/features/partner-applications/partner-applications-service";
import { apiRequest } from "@/services/api-client";

vi.mock("@/services/api-client", () => ({
  apiRequest: vi.fn(),
}));

const apiRequestMock = vi.mocked(apiRequest);

const application = {
  id: "d544f57d-6cf0-4a78-b442-89bec9bb9037",
  status: "PENDING_REVIEW",
  submittedAt: "2026-08-01T10:00:00.000Z",
  reviewDeadlineAt: "2026-08-03T10:00:00.000Z",
  legalName: "Oficina Teste LTDA",
  tradeName: "Oficina Teste",
  cnpj: "12345678000190",
  responsibleName: "Responsável Teste",
  contactEmail: "partner@vekko.test",
  contactPhone: "85999999999",
  postalCode: "60000000",
  street: "Rua Teste",
  addressNumber: "100",
  neighborhood: "Centro",
  city: "Fortaleza",
  state: "CE",
  businessCategory: "Oficina",
  serviceDescription: "Manutenção automotiva",
  invitationSent: false,
};

describe("partner applications service", () => {
  beforeEach(() => {
    apiRequestMock.mockReset();
  });

  it("lista somente solicitações pendentes com paginação", async () => {
    apiRequestMock.mockResolvedValue({
      items: [application],
      meta: { page: 2, limit: 20, total: 21, totalPages: 2 },
    });

    await expect(listPendingPartnerApplications(2)).resolves.toEqual({
      items: [application],
      meta: { page: 2, limit: 20, total: 21, totalPages: 2 },
    });
    expect(apiRequestMock).toHaveBeenCalledWith(
      "/admin/partner-applications?status=PENDING_REVIEW&page=2&limit=20",
    );
  });

  it("aprova a solicitação pelo endpoint administrativo", async () => {
    const approvedApplication = {
      ...application,
      status: "APPROVED",
      reviewedAt: "2026-08-01T11:00:00.000Z",
      invitationSent: true,
    };
    apiRequestMock.mockResolvedValue(approvedApplication);

    await expect(approvePartnerApplication(application.id)).resolves.toEqual(
      approvedApplication,
    );
    expect(apiRequestMock).toHaveBeenCalledWith(
      `/admin/partner-applications/${application.id}/approve`,
      { method: "PATCH" },
    );
  });

  it("rejeita respostas de listagem fora do contrato", async () => {
    apiRequestMock.mockResolvedValue({
      items: [{ ...application, status: "ROLE_INVENTADA" }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });

    await expect(listPendingPartnerApplications(1)).rejects.toThrow(
      "A API retornou dados inválidos",
    );
  });
});
