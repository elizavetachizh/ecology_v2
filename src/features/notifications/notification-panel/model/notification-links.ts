import {
  TRANSPORT_UNIT_THRESHOLD_CODE,
  type Notification,
  type NotificationPayload,
} from "../../../../entities/notifications";
import { routes } from "../../../../shared/config/routes";

export type NotificationOperationsLink = {
  kind: "operations";
  label: "Операции по этой паре";
  to: typeof routes.operations.list;
  search: {
    unit_id: string;
    waste_id: string;
  };
};

export type NotificationUnitLink = {
  kind: "unit";
  label: "Место учёта";
  to: typeof routes.directories.units.detail;
  params: {
    unitId: string;
  };
  search: {
    instructionId: string;
  };
};

export type NotificationPanelLink =
  NotificationOperationsLink | NotificationUnitLink;

function payloadId(payload: NotificationPayload, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Ссылки только у `transport_unit_threshold`.
 * Неизвестный код возвращает пустой список: карточка показывает `title` и `body`.
 */
export function notificationLinks(
  notification: Notification,
): NotificationPanelLink[] {
  if (notification.code !== TRANSPORT_UNIT_THRESHOLD_CODE) return [];

  const unitId = payloadId(notification.payload, "unit_id");
  const wasteId = payloadId(notification.payload, "waste_id");
  const instructionId = payloadId(notification.payload, "instruction_id");
  const links: NotificationPanelLink[] = [];

  if (unitId && wasteId) {
    links.push({
      kind: "operations",
      label: "Операции по этой паре",
      to: routes.operations.list,
      search: { unit_id: unitId, waste_id: wasteId },
    });
  }

  if (unitId && instructionId) {
    links.push({
      kind: "unit",
      label: "Место учёта",
      to: routes.directories.units.detail,
      params: { unitId },
      search: { instructionId },
    });
  }

  return links;
}
