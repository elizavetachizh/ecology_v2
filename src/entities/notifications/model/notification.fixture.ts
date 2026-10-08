import {
  TRANSPORT_UNIT_THRESHOLD_CODE,
  type Notification,
  type NotificationSummary,
  type TransportUnitThresholdPayload,
} from "./notifications.types";

export const transportUnitThresholdPayloadFixture: TransportUnitThresholdPayload =
  {
    unit_id: "unit-1",
    waste_id: "waste-1",
    instruction_id: "instruction-1",
    uiw_id: "uiw-1",
    amount: "8.500000",
    transport_unit: "10.000000",
    ratio: "0.85",
  };

export const notificationFixture: Notification = {
  id: "notification-1",
  source: "system",
  code: TRANSPORT_UNIT_THRESHOLD_CODE,
  severity: "warning",
  status: "open",
  subject_key: "7f3a9c2e1b4d8f0a6e5c3b2a19084765",
  title: "Остаток приближается к транспортной единице",
  body: "Цех А, 1010100 Test waste: 8.500000 из 10.000000 (85.0%).",
  payload: { ...transportUnitThresholdPayloadFixture },
  detected_at: "2026-10-01T06:00:00Z",
  resolved_at: null,
};

export const notificationSummaryFixture: NotificationSummary = {
  open: 2,
  warning: 1,
  critical: 1,
};

export function makeNotification(
  overrides: Partial<Notification> = {},
): Notification {
  return { ...notificationFixture, ...overrides };
}
