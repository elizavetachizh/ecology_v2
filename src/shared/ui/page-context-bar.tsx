import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type PageContextBarProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /**
   * Sticky chrome for forms (default).
   * List pages: `sticky={false}` — обычный page header без прилипания.
   */
  sticky?: boolean;
  className?: string;
};

export function PageContextBar({
  eyebrow,
  title,
  description,
  actions,
  sticky = true,
  className,
}: PageContextBarProps) {
  return (
    <div
      data-slot="page-context-bar"
      className={cn(
        "flex flex-wrap items-start justify-between gap-3",
        sticky &&
          "sticky top-0 z-20 -mx-2 border-b bg-background/95 px-2 py-3 backdrop-blur",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow ? (
          typeof eyebrow === "string" ? (
            <div className="text-xs font-medium text-muted-foreground">
              {eyebrow}
            </div>
          ) : (
            <div className="min-w-0">{eyebrow}</div>
          )
        ) : null}
        <h1
          className={cn(
            "text-2xl font-semibold tracking-tight text-foreground",
            sticky && "truncate",
          )}
        >
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
