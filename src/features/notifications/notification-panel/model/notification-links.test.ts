import { describe, expect, it } from "vitest";
import {
  makeNotification,
  notificationFixture,
  transportUnitThresholdPayloadFixture,
} from "../../../../entities/notifications/model/notification.fixture";
import { routes } from "../../../../shared/config/routes";
import { notificationLinks } from "./notification-links";

describe("notificationLinks", () => {
  it("links a transport unit threshold to operations and the unit", () => {
    expect(notificationLinks(notificationFixture)).toEqual([
      {
        kind: "operations",
        label: "Операции по этой паре",
        to: routes.waste.operations.list,
        search: { unit_id: "unit-1", waste_id: "waste-1" },
      },
      {
        kind: "unit",
        label: "Место учёта",
        to: routes.directories.units.detail,
        params: { unitId: "unit-1" },
        search: { instructionId: "instruction-1" },
      },
    ]);
  });

  it("returns no links for an unknown code, even when the payload has unit ids", () => {
    const notification = makeNotification({
      code: "admin_notice",
      title: "Плановые работы",
      body: "Сервис будет недоступен",
      payload: { ...transportUnitThresholdPayloadFixture },
    });

    expect(notificationLinks(notification)).toEqual([]);
  });

  it("skips a link when its ids are blank", () => {
    const notification = makeNotification({
      payload: {
        ...transportUnitThresholdPayloadFixture,
        waste_id: " ",
      },
    });

    expect(notificationLinks(notification)).toEqual([
      {
        kind: "unit",
        label: "Место учёта",
        to: routes.directories.units.detail,
        params: { unitId: "unit-1" },
        search: { instructionId: "instruction-1" },
      },
    ]);
  });
});
