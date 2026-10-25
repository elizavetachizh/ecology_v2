import type { PeriodLock } from "../../../../entities/waste/operations";
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

  return (
    <PeriodLockDialog
      open={open}
      onOpenChange={onOpenChange}
      periodLock={periodLock}
    />
  );
}
