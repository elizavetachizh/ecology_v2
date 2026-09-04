import { useId, useMemo, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "../../../shared/lib/cn";
import {
  filterTenantTree,
  flattenTenantTree,
  tenantLabel,
} from "../model/flatten-tenant-tree";
import type { Tenant } from "../model/tenant.types";

export type TenantSelectProps = {
  tenants: Tenant[];
  value: string | null;
  onValueChange: (tenantId: string) => void;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  placeholder?: string;
  emptyMessage?: string;
  "aria-label"?: string;
};

export function TenantSelect({
  tenants,
  value,
  onValueChange,
  disabled = false,
  className,
  contentClassName,
  placeholder = "Выберите организацию",
  emptyMessage = "Нет доступных организаций",
  "aria-label": ariaLabel = "Активная организация",
}: TenantSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const listId = useId();

  const nodes = useMemo(
    () => filterTenantTree(tenants, search),
    [tenants, search],
  );

  const selected = useMemo(
    () => flattenTenantTree(tenants).find((n) => n.tenant.id === value)?.tenant,
    [tenants, value],
  );

  const hasTenants = tenants.length > 0;
  const isDisabled = disabled || !hasTenants;

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) setSearch("");
  };

  const select = (tenantId: string) => {
    onValueChange(tenantId);
    setOpen(false);
  };

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="tree"
          disabled={isDisabled}
          className={cn(
            "flex h-9 min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1 text-left text-sm shadow-sm",
            "outline-none transition-colors",
            "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span
            className={cn(
              "min-w-0 truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {selected
              ? tenantLabel(selected)
              : hasTenants
                ? placeholder
                : emptyMessage}
          </span>
          <ChevronsUpDown
            aria-hidden
            className="size-4 shrink-0 text-muted-foreground"
          />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={4}
          className={cn(
            "z-50 w-[var(--radix-popover-trigger-width)] min-w-64 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md",
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
              placeholder="Поиск организации"
              aria-label="Поиск организации"
              autoFocus
              className={cn(
                "h-8 w-full rounded-md bg-transparent pr-8 pl-8 text-sm outline-none",
                "placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40",
              )}
            />
            {search ? (
              <button
                type="button"
                aria-label="Очистить поиск"
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div
            id={listId}
            role="tree"
            aria-label={ariaLabel}
            className="max-h-72 overflow-y-auto p-1"
          >
            {nodes.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {search.trim() ? "Ничего не найдено" : emptyMessage}
              </p>
            ) : (
              nodes.map(({ tenant, depth }) => {
                const selectedItem = tenant.id === value;
                const label = tenantLabel(tenant);
                const short = tenant.short.trim();
                const showFullName = Boolean(short) && short !== tenant.name;
                return (
                  <button
                    key={tenant.id}
                    type="button"
                    role="treeitem"
                    aria-selected={selectedItem}
                    aria-level={depth + 1}
                    onClick={() => select(tenant.id)}
                    style={{ paddingLeft: `${0.5 + depth * 1.25}rem` }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm py-1.5 pr-2 text-left text-sm outline-none",
                      "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                      selectedItem && "bg-accent text-accent-foreground",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{label}</span>
                      {showFullName ? (
                        <span className="block truncate text-xs font-normal text-muted-foreground">
                          {tenant.name}
                        </span>
                      ) : null}
                    </span>
                    {selectedItem ? (
                      <Check aria-hidden className="size-3.5 shrink-0" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
