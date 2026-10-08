export type NotificationSeverity = "info" | "warning" | "critical";
export type NotificationStatus = "open" | "resolved";
export type NotificationSource = "system" | "admin";

export const TRANSPORT_UNIT_THRESHOLD_CODE = "transport_unit_threshold";

/** Снимок проверки. Значения — строки. */
export type NotificationPayload = Record<string, string>;

/** Поля `payload` для `transport_unit_threshold`. */
export type TransportUnitThresholdPayload = {
  unit_id: string;
  waste_id: string;
  instruction_id: string;
  uiw_id: string;
  amount: string;
  transport_unit: string;
  ratio: string;
};

export type Notification = {
  id: string;
  source: NotificationSource;
  code: string;
  severity: NotificationSeverity;
  status: NotificationStatus;
  /** Идентичность субъекта. В UI не показывать: ссылки только из `payload`. */
  subject_key: string;
  title: string;
  body: string | null;
  payload: NotificationPayload;
  detected_at: string;
  resolved_at: string | null;
};

export type NotificationListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Notification[];
};

export type NotificationSummary = {
  open: number;
  warning: number;
  critical: number;
};

export type GetNotificationsParams = {
  status?: NotificationStatus;
  severity?: NotificationSeverity;
  code?: string;
  limit: number;
  offset: number;
};

export const DEFAULT_NOTIFICATIONS_LIST_LIMIT = 50;

export const DEFAULT_NOTIFICATIONS_LIST_PARAMS: GetNotificationsParams = {
  status: "open",
  limit: DEFAULT_NOTIFICATIONS_LIST_LIMIT,
  offset: 0,
};

export const NOTIFICATION_SEVERITY_LABEL: Record<NotificationSeverity, string> =
  {
    critical: "Превышение",
    warning: "Близко к лимиту",
    info: "Информация",
  };

export const NOTIFICATION_SEVERITY_BADGE_VARIANT: Record<
  NotificationSeverity,
  "destructive" | "warning" | "info"
> = {
  critical: "destructive",
  warning: "warning",
  info: "info",
};

export function isTransportUnitThresholdNotification(
  notification: Notification,
): notification is Notification & {
  code: typeof TRANSPORT_UNIT_THRESHOLD_CODE;
  payload: TransportUnitThresholdPayload;
} {
  return notification.code === TRANSPORT_UNIT_THRESHOLD_CODE;
}
