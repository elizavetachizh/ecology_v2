import { useEffect, useRef, useState } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Info } from "lucide-react";
import { cn } from "../../../../shared/lib/cn";
import { formatDate } from "../../../../shared/lib/format-date";
import { Button } from "../../../../shared/ui";

const CLOSE_DELAY_MS = 100;

type PeriodLockInfoProps = {
  lockDate: string;
};

export function PeriodLockInfo({ lockDate }: PeriodLockInfoProps) {
  const [open, setOpen] = useState(false);
  const pinnedRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimerRef.current === null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const show = () => {
    cancelClose();
    setOpen(true);
  };

  const close = () => {
    pinnedRef.current = false;
    cancelClose();
    setOpen(false);
  };

  const scheduleClose = () => {
    if (pinnedRef.current) return;
    cancelClose();
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      if (!pinnedRef.current) setOpen(false);
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground"
          aria-label="Операционный период"
          onPointerEnter={show}
          onPointerLeave={scheduleClose}
          onClick={(event) => {
            event.preventDefault();
            if (pinnedRef.current) {
              close();
              return;
            }
            pinnedRef.current = true;
            show();
          }}
        >
          <Info />
        </Button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="bottom"
          align="start"
          sideOffset={6}
          data-slot="period-lock-info"
          onOpenAutoFocus={(event) => event.preventDefault()}
          onPointerEnter={show}
          onPointerLeave={scheduleClose}
          className={cn(
            "z-50 max-w-sm rounded-md border border-border bg-popover p-3 text-sm text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
        >
          {`Операционный период закрыт ${formatDate(lockDate)}. Операции с этой датой и раньше нельзя создавать и изменять.`}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
