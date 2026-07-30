import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

export type SelectProps = React.ComponentProps<"select">;

function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className={cn("relative inline-flex min-w-0", className)}>
      <select
        data-slot="select"
        className={cn(
          "h-9 w-full appearance-none truncate rounded-md border border-input bg-background py-1 pr-9 pl-3 text-sm text-foreground shadow-sm",
          "outline-none transition-colors",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/30",
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

export { Select };
