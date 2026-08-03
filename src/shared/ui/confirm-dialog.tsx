import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "./modal";

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Удалить запись?",
  description,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  confirmDisabled = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-md" showClose={false}>
        <ModalHeader className="pr-0">
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-destructive-muted text-destructive">
            <AlertTriangle className="size-5" aria-hidden />
          </div>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription asChild>
            <div className="pt-1">{description}</div>
          </ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={confirmDisabled}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
