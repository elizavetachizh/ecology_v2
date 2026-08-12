import type { ReactNode } from "react";
import { cn } from "../lib/cn";

type FieldLabelProps = {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
};

function FieldLabel({
  htmlFor,
  children,
  required = false,
  className,
}: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium leading-none text-foreground", className)}
    >
      {children}
      {required ? (
        <span className="ml-0.5 text-destructive" aria-hidden>
          *
        </span>
      ) : null}
    </label>
  );
}

type FieldDescriptionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

function FieldDescription({ children, className, id }: FieldDescriptionProps) {
  return (
    <p
      id={id}
      className={cn("text-xs leading-relaxed text-muted-foreground", className)}
    >
      {children}
    </p>
  );
}

type FieldErrorProps = {
  children?: ReactNode;
  className?: string;
};

function FieldError({ children, className }: FieldErrorProps) {
  if (!children) return null;
  return (
    <p className={cn("text-xs text-destructive", className)} role="alert">
      {children}
    </p>
  );
}

type FieldProps = {
  children: ReactNode;
  className?: string;
};

function Field({ children, className }: FieldProps) {
  return <div className={cn("grid gap-1.5", className)}>{children}</div>;
}

type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        "grid gap-4 rounded-xl border border-border bg-card p-4 md:grid-cols-2",
        className,
      )}
    >
      <div className="space-y-1 md:col-span-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FormSection,
};
