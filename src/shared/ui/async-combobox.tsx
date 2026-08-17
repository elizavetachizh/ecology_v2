import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "../lib/cn";

export type AsyncComboboxOption = {
  value: string;
  /** Строка для поиска, a11y и кэша выбранного значения */
  label: string;
  disabled?: boolean;
  keywords?: string[];
};

export type AsyncComboboxProps = {
  options: AsyncComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  "aria-label"?: string;
  search: string;
  setSearch: (value: string) => void;
  selectedLabel?: string;
  /** Кастомный рендер пункта списка. По умолчанию — `option.label`. */
  renderOption?: (
    option: AsyncComboboxOption,
    state: { selected: boolean },
  ) => React.ReactNode;
  /** Кастомный рендер выбранного значения на триггере. По умолчанию — `label`. */
  renderValue?: (option: { value: string; label: string }) => React.ReactNode;
};

export function AsyncCombobox({
  options,
  search,
  setSearch,
  value,
  onValueChange,
  placeholder = "Выберите опцию",
  searchPlaceholder = "Поиск…",
  emptyMessage = "Ничего не найдено",
  disabled = false,
  className,
  contentClassName,
  "aria-label": ariaLabel,
  selectedLabel,
  renderOption,
  renderValue,
}: AsyncComboboxProps) {
  const [open, setOpen] = React.useState(false);
  /** Label выбранного value после сброса поиска (пишется только в handlers). */
  const [cachedSelection, setCachedSelection] = React.useState<{
    value: string;
    label: string;
  } | null>(() =>
    selectedLabel && value ? { value, label: selectedLabel } : null,
  );
  const listboxId = React.useId();

  const selectedFromOptions = options.find((option) => option.value === value);

  const resolvedLabel = value
    ? (selectedFromOptions?.label ??
      selectedLabel ??
      (cachedSelection?.value === value ? cachedSelection.label : undefined))
    : undefined;

  const selectedOption =
    selectedFromOptions ??
    (value && resolvedLabel ? { value, label: resolvedLabel } : undefined);

  const clearSelection = () => {
    setCachedSelection(null);
    onValueChange("");
    setOpen(false);
    setSearch("");
  };

  const toggleOption = (option: AsyncComboboxOption) => {
    if (option.disabled) return;

    setCachedSelection({ value: option.value, label: option.label });
    onValueChange(option.value);
    setOpen(false);
    setSearch("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch("");
  };

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
          data-slot="async-combobox-trigger"
          className={cn(
            "flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-left text-sm shadow-sm",
            "outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selectedOption ? (
              <span
                key={selectedOption.value}
                className="inline-flex max-w-full items-center gap-1.5 rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
              >
                {renderValue ? (
                  renderValue(selectedOption)
                ) : (
                  <span className="min-w-0 truncate">
                    {selectedOption.label}
                  </span>
                )}
              </span>
            ) : (
              <span className="truncate text-muted-foreground">
                {placeholder}
              </span>
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
          data-slot="async-combobox-content"
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
            className="max-h-64 overflow-y-auto p-1"
          >
            {options.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </p>
            ) : (
              options.map((option) => {
                const selected = value === option.value;

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
                      selected && "bg-accent text-accent-foreground",
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      {renderOption ? (
                        renderOption(option, { selected })
                      ) : (
                        <span className="min-w-0 flex-1 truncate">
                          {option.label}
                        </span>
                      )}
                    </span>
                    {selected ? (
                      <Check aria-hidden className="size-3 shrink-0" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          {value && (
            <div className="border-t border-border p-1">
              <button
                type="button"
                onClick={clearSelection}
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
