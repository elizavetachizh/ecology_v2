import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "../lib/cn";

export type MultipleComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
  keywords?: string[];
};

export type MultipleComboboxProps = {
  options: MultipleComboboxOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  maxVisibleValues?: number;
  search: string;
  setSearch: (value: string) => void;
  "aria-label"?: string;
};

export function MultipleCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Выберите значения",
  searchPlaceholder = "Поиск…",
  emptyMessage = "Ничего не найдено",
  disabled = false,
  className,
  contentClassName,
  maxVisibleValues = 2,
  search,
  setSearch,
  "aria-label": ariaLabel,
}: MultipleComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const listboxId = React.useId();

  const selectedOptions = React.useMemo(() => {
    const selected = new Set(value);
    return options.filter((option) => selected.has(option.value));
  }, [options, value]);

  const toggleOption = (option: MultipleComboboxOption) => {
    if (option.disabled) return;

    onValueChange(
      value.includes(option.value)
        ? value.filter((item) => item !== option.value)
        : [...value, option.value],
    );
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch("");
  };

  const visibleValues = selectedOptions.slice(0, maxVisibleValues);
  const hiddenValuesCount = selectedOptions.length - visibleValues.length;

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          disabled={disabled}
          data-slot="multiple-combobox-trigger"
          className={cn(
            "flex min-h-9 min-w-0 w-full items-center justify-between gap-2 overflow-hidden rounded-md border border-input bg-background px-3 py-1.5 text-left text-sm shadow-sm",
            "outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedOptions.length === 0 ? (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
            ) : (
              <>
                {visibleValues.map((option) => (
                  <span
                    key={option.value}
                    className="max-w-48 truncate rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
                  >
                    {option.label}
                  </span>
                ))}
                {hiddenValuesCount > 0 && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    +{hiddenValuesCount}
                  </span>
                )}
              </>
            )}
          </span>
          <ChevronsUpDown
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          data-slot="multiple-combobox-content"
          className={cn(
            "z-50 w-[var(--radix-popover-trigger-width)] min-w-56 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            contentClassName,
          )}
        >
          <div className="relative border-b border-border p-2">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              autoFocus
              className={cn(
                "h-8 w-full rounded-md bg-transparent pr-8 pl-8 text-sm outline-none",
                "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
            />
            {search && (
              <button
                type="button"
                aria-label="Очистить поиск"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            )}
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="max-h-64 overflow-y-auto p-1"
          >
            {options.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </p>
            ) : (
              options.map((option) => {
                const selected = value.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    onClick={() => toggleOption(option)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                      "disabled:pointer-events-none disabled:opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "text-transparent",
                      )}
                    >
                      <Check aria-hidden className="size-3" />
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {option.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {value.length > 0 && (
            <div className="border-t border-border p-1">
              <button
                type="button"
                onClick={() => onValueChange([])}
                className="w-full rounded-sm px-2 py-1.5 text-center text-xs text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent"
              >
                Очистить выбор
              </button>
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
