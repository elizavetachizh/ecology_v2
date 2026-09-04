import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Printer } from "lucide-react";
import { Button } from "../../../../shared/ui";
import { cn } from "../../../../shared/lib/cn";
import { usePrintPassport } from "../model/use-print-passport";

type PrintPassportButtonProps = {
  passportId: string;
  number: string;
  size?: "default" | "sm";
};

const formatItemClassName = cn(
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
  "focus:bg-accent focus:text-accent-foreground",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
);

export function PrintPassportButton({
  passportId,
  number,
  size = "default",
}: PrintPassportButtonProps) {
  const { print, pending } = usePrintPassport();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button type="button" variant="outline" size={size} disabled={pending}>
          <Printer />
          {pending ? "Печать…" : "Печать"}
          <ChevronDown />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className={cn(
            "z-50 min-w-36 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
        >
          <DropdownMenu.Item
            className={formatItemClassName}
            disabled={pending}
            onSelect={() => print(passportId, number, "docx")}
          >
            Word
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className={formatItemClassName}
            disabled={pending}
            onSelect={() => print(passportId, number, "pdf")}
          >
            PDF
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
