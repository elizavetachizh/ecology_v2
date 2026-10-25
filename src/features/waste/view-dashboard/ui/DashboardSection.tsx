import type { ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  PageContextBar,
} from "../../../../shared/ui";
import { cn } from "../../../../shared/lib/cn";

type DashboardSectionProps = {
  error: Error | null;
  errorTitle: string;
  title: string;
  description: string;
  actions?: ReactNode;
  table: ReactNode;
  chart: ReactNode;
  className?: string;
};

export function DashboardSection({
  error,
  errorTitle,
  title,
  description,
  actions,
  table,
  chart,
  className,
}: DashboardSectionProps) {
  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <PageContextBar
        sticky={false}
        title={title}
        description={description}
        actions={actions}
      />
      <div
        className={cn(
          "grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]",
          className,
        )}
      >
        {table}
        <div className="xl:sticky xl:top-4">{chart}</div>
      </div>
    </div>
  );
}
