import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "./alert";

export type TenantRequiredGateProps = {
  /** Активный tenant с page/feature; `null`/`undefined` → empty-state. */
  tenantId: string | null | undefined;
  children: ReactNode;
  /**
   * Краткое имя экрана/справочника для дефолтного текста.
   * Пример: «инструкций», «отходов», «структуры».
   * Игнорируется, если задан `description`.
   */
  resourceLabel?: string;
  /** Полный текст описания; перекрывает `resourceLabel`. */
  description?: ReactNode;
  title?: ReactNode;
};

/**
 * Платформенный empty-state: MDM/tenant-scoped контент не рендерится
 * без выбранной организации. Tenant читает page (`useTenant`) и передаёт сюда.
 */
export function TenantRequiredGate({
  tenantId,
  children,
  resourceLabel,
  description,
  title = "Выберите организацию",
}: TenantRequiredGateProps) {
  if (tenantId) {
    return children;
  }

  const body =
    description ??
    (resourceLabel
      ? `Чтобы работать со справочником ${resourceLabel}, выберите организацию в верхней панели.`
      : "Выберите организацию в верхней панели, чтобы продолжить.");

  return (
    <Alert variant="info">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{body}</AlertDescription>
    </Alert>
  );
}
