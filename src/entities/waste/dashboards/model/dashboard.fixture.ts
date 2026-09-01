import type {
  DashboardBalance,
  DashboardBalanceStat,
} from "./dashboards.types";

export const dashboardBalanceFixture: DashboardBalance = {
  unit: { id: "unit-1", name: "Цех А", short_name: "А" },
  wastes: [
    {
      waste: {
        id: "waste-1",
        waste_classifier_id: 1001,
        waste_classifier: { id: 1001, code: 1010100, name: "Test waste" },
        hazard_class: "unclassified",
        uom: "kg",
      },
      amount: "15.000000",
    },
    {
      waste: {
        id: "waste-2",
        waste_classifier_id: 1002,
        waste_classifier: { id: 1002, code: 1010200, name: "Zero waste" },
        hazard_class: "class_4",
        uom: "kg",
      },
      amount: "0",
    },
  ],
};

export const dashboardBalanceStatFixture: DashboardBalanceStat = {
  unit: dashboardBalanceFixture.unit,
  waste: dashboardBalanceFixture.wastes[0]!.waste,
  points: [
    { date: "2026-03-31", amount: "0" },
    { date: "2026-04-30", amount: "0" },
    { date: "2026-05-31", amount: "10.000000" },
    { date: "2026-06-30", amount: "10.000000" },
    { date: "2026-07-31", amount: "15.000000" },
    { date: "2026-08-15", amount: "15.000000" },
  ],
};

export function makeDashboardBalance(
  overrides: Partial<DashboardBalance> = {},
): DashboardBalance {
  return {
    ...dashboardBalanceFixture,
    ...overrides,
    wastes: overrides.wastes ?? dashboardBalanceFixture.wastes,
  };
}
