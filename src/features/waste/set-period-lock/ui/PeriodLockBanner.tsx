import type { PeriodLock } from "../../../../entities/waste/operations";
import { formatDate, formatDateTime } from "../../../../shared/lib/format-date";
import { Alert, AlertDescription, AlertTitle } from "../../../../shared/ui";
import { PeriodLockDialog } from "./PeriodLockDialog";

type PeriodLockBannerProps = {
  periodLock: PeriodLock | null;
  loading?: boolean;
  error?: Error | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PeriodLockBanner({
  periodLock,
  loading = false,
  error = null,
  open,
  onOpenChange,
}: PeriodLockBannerProps) {
  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Загрузка операционного периода…
      </p>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить операционный период</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  const lockDate = periodLock?.lock_date ?? null;
  const updatedBy = periodLock?.updated_by ?? null;
  const updatedAt = periodLock?.updated_at ?? null;

  return (
    <>
      {lockDate ? (
        <Alert variant="warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <AlertDescription>
                {`Закрыт по ${formatDate(lockDate)}. Операции с этой датой и раньше нельзя создавать и изменять.`}
              </AlertDescription>
              {updatedBy && updatedAt ? (
                <AlertDescription>
                  {`Изменил ${updatedBy.username}, ${formatDateTime(updatedAt)}`}
                </AlertDescription>
              ) : null}
            </div>
          </div>
        </Alert>
      ) : null}
      <PeriodLockDialog
        open={open}
        onOpenChange={onOpenChange}
        periodLock={periodLock}
      />
    </>
  );
}
