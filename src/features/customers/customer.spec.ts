import { describe, expect, it } from "vitest";

import { parseCustomerList } from "./customer";

describe("customer contract", () => {
  it("parses paginated customers", () => {
    const result = parseCustomerList({
      items: [
        {
          activeVehicleCount: 1,
          createdAt: "2026-08-02T12:00:00.000Z",
          email: "cliente@vekko.test",
          id: "af3543a2-a4cb-40bf-88d4-9e916e674c37",
          profile: {
            complete: true,
            completedAt: "2026-08-02T12:00:00.000Z",
            cpfNormalized: "52998224725",
            fullName: "Cliente VEKKO",
            phoneNormalized: "34999998888",
          },
          status: "ACTIVE",
          updatedAt: "2026-08-02T12:00:00.000Z",
        },
      ],
      meta: { limit: 20, page: 1, total: 1, totalPages: 1 },
    });

    expect(result.items[0]?.profile.fullName).toBe("Cliente VEKKO");
    expect(result.meta.total).toBe(1);
  });
});
