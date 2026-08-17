import { useSyncExternalStore } from "react";

export type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastListener = () => void;

let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: ToastListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return toasts;
}

function push(variant: ToastVariant, message: string) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, message, variant }];
  emit();

  timers.set(
    id,
    setTimeout(() => {
      dismiss(id);
    }, 4000),
  );

  return id;
}

export function dismiss(id: string) {
  const timer = timers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(id);
  }

  const next = toasts.filter((t) => t.id !== id);
  if (next.length === toasts.length) return;
  toasts = next;
  emit();
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
};

export function useToasts() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
