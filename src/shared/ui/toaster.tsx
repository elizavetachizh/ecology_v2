import { X } from "lucide-react";
import { Alert, AlertDescription } from "./alert";
import { Button } from "./button";
import { dismiss, useToasts } from "./toast-store";

export function Toaster() {
  const toasts = useToasts();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 p-2"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <Alert
          key={item.id}
          variant={item.variant}
          className="pointer-events-auto shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <AlertDescription>{item.message}</AlertDescription>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-6 shrink-0 text-current"
              aria-label="Закрыть"
              onClick={() => dismiss(item.id)}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        </Alert>
      ))}
    </div>
  );
}

export { toast } from "./toast-store";
