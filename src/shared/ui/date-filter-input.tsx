import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";
import { Input, type InputProps } from "./input";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type DateFilterInputProps = Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onChange"
> & {
  value?: string;
  onValueChange: (next: string | undefined) => void;
};

export function DateFilterInput({
  value,
  onValueChange,
  className,
  onFocus,
  onBlur,
  ...props
}: DateFilterInputProps) {
  const committed = value ?? "";
  const focusedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el || focusedRef.current) return;
    if (el.value !== committed) el.value = committed;
  }, [committed]);

  return (
    <Input
      {...props}
      ref={inputRef}
      type="date"
      className={cn("w-40", className)}
      defaultValue={committed}
      onFocus={(event) => {
        focusedRef.current = true;
        onFocus?.(event);
      }}
      onChange={(event) => {
        const next = event.currentTarget.value;
        if (ISO_DATE_RE.test(next)) onValueChange(next);
      }}
      onBlur={(event) => {
        focusedRef.current = false;
        const next = event.currentTarget.value || undefined;
        if (next !== (value || undefined)) onValueChange(next);
        onBlur?.(event);
      }}
    />
  );
}
