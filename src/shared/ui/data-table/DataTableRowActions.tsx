import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../button";
import { cn } from "../../lib/cn";

export type DataTableRowActionsProps = {
  children: React.ReactNode;
  className?: string;
  label?: string;
};

export function DataTableRowActions({
  children,
  className,
  label = "Действия со строкой",
}: DataTableRowActionsProps) {
  return (
    <div
      data-slot="data-table-row-actions"
      className={cn("flex items-center justify-end", className)}
      onClick={(event) => event.stopPropagation()}
    >
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={label}
            title={label}
          >
            <MoreHorizontal />
          </Button>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={4}
            className={cn(
              "z-50 min-w-44 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
            )}
          >
            {children}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
}

export type DataTableRowActionProps = React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> & {
  label: string;
};

export function DataTableRowAction({
  label,
  children,
  className,
  ...props
}: DataTableRowActionProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="data-table-row-action"
      aria-label={label}
      title={label}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
        "focus:bg-accent focus:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children ?? label}
    </DropdownMenuPrimitive.Item>
  );
}
