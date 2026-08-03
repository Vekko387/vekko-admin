import { describe, expect, it } from "vitest";

import { parseAdminVehicleList } from "./vehicle";

describe("admin vehicle contract", () => {
  it("parses the vehicle owner and pagination", () => {
    const result = parseAdminVehicleList({
      items: [
        {
          brand: "Toyota",
          color: "Prata",
          createdAt: "2026-08-02T12:00:00.000Z",
          id: "a4e2bd9c-689c-4d9a-9d0c-7b9c13f6ba4b",
          isPrimary: true,
          model: "Corolla",
          nickname: null,
          owner: {
            cpfNormalized: "52998224725",
            email: "cliente@vekko.test",
            fullName: "Cliente VEKKO",
            id: "a7dd394e-ac3c-445b-a4fa-aa649f9343c6",
          },
          plateNormalized: "ABC1D23",
          status: "ACTIVE",
          type: "SEDAN",
          updatedAt: "2026-08-02T12:00:00.000Z",
          year: null,
        },
      ],
      meta: { limit: 20, page: 1, total: 1, totalPages: 1 },
    });

    expect(result.items[0]?.owner.fullName).toBe("Cliente VEKKO");
    expect(result.items[0]?.year).toBeNull();
  });
});
