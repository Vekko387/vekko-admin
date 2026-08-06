import { describe, expect, it } from "vitest";

import {
  getBenefitLabel,
  InvalidPlanResponseError,
  parseAdminPlan,
  parseAdminPlanList,
  parsePriceInput,
} from "./plan";

const validPlan = {
  benefit: { maxUsesPerDay: null, mode: "LIMITED", washesPerCycle: 4 },
  code: "ESSENTIAL",
  createdAt: "2026-08-03T12:00:00.000Z",
  description: "Plano oficial.",
  displayOrder: 2,
  id: "00000000-0000-4000-8000-000000000002",
  monthlyPriceCents: 11990,
  name: "Essential",
  status: "ACTIVE",
  updatedAt: "2026-08-03T12:00:00.000Z",
  vehicleEligibilities: [
    { allowed: true, vehicleType: "HATCH" },
    { allowed: true, vehicleType: "SEDAN" },
    { allowed: true, vehicleType: "SUV" },
    { allowed: true, vehicleType: "PICKUP" },
  ],
};

describe("admin plan contract", () => {
  it("parses the fixed catalog response", () => {
    expect(parseAdminPlanList({ items: [validPlan] })).toHaveLength(1);
  });

  it("rejects malformed benefit data", () => {
    expect(() =>
      parseAdminPlan({
        ...validPlan,
        benefit: { mode: "INFINITE", washesPerCycle: Infinity },
      }),
    ).toThrow(InvalidPlanResponseError);
  });

  it.each([
    ["119,90", 11990],
    ["R$ 1.234,56", 123456],
    ["79.90", 7990],
  ])("converts %s to cents", (input, expected) => {
    expect(parsePriceInput(input)).toBe(expected);
  });

  it("represents unlimited usage without a numeric balance", () => {
    const unlimited = parseAdminPlan({
      ...validPlan,
      benefit: {
        maxUsesPerDay: 1,
        mode: "UNLIMITED",
        washesPerCycle: null,
      },
      code: "UNLIMITED",
    });

    expect(getBenefitLabel(unlimited)).toBe("Ilimitado · máximo de 1 por dia");
    expect(unlimited.benefit.washesPerCycle).toBeNull();
  });
});
