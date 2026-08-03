import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type PageContextBarProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PageContextBar({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageContextBarProps) {
  return (
    <div
      data-slot="page-context-bar"
      className={cn(
        "sticky top-0 z-20 -mx-2 flex flex-wrap items-start justify-between gap-3 border-b border-border bg-background/95 px-2 py-3 backdrop-blur",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          <div className="text-xs font-medium text-muted-foreground">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <div className="text-sm text-muted-foreground">{description}</div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
