import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../lib/cn";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:top-3.5 [&>svg]:left-4 [&>svg+div]:translate-y-0 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        neutral:
          "border-border bg-muted/60 text-foreground [&>svg]:text-muted-foreground",
        success:
          "border-success/30 bg-success-muted text-success [&>svg]:text-success",
        warning:
          "border-warning/40 bg-warning-muted text-warning-foreground [&>svg]:text-warning",
        error:
          "border-destructive/30 bg-destructive-muted text-destructive [&>svg]:text-destructive",
        info: "border-info/30 bg-info-muted text-info [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

const alertIcons: Record<
  NonNullable<VariantProps<typeof alertVariants>["variant"]>,
  LucideIcon
> = {
  neutral: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

export type AlertProps = React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    /** Показать иконку варианта (по умолчанию true) */
    showIcon?: boolean;
  };

function Alert({
  className,
  variant = "neutral",
  showIcon = true,
  children,
  ...props
}: AlertProps) {
  const Icon = alertIcons[variant ?? "neutral"];

  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      {showIcon ? <Icon className="size-4" /> : null}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("text-sm opacity-90 [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, alertVariants };
