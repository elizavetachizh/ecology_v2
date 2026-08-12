import { useEffect, useRef, useState } from "react";

import { useDebounce } from "../hooks";
import { Input } from "./input";
import { cn } from "../lib/cn";

const DEFAULT_DEBOUNCE_MS = 400;

export type ListSearchFieldProps = {
  /** Закоммиченное значение (обычно из URL `search.q`). */
  value?: string;
  /** После debounce и по Enter. Уже `trim`. */
  onSearch: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

/**
 * Поиск для list-экранов: debounce, без кнопки «Найти».
 * Enter применяет сразу. Фильтры — siblings на page.
 */
export function ListSearchField({
  value = "",
  onSearch,
  placeholder = "Поиск",
  debounceMs = DEFAULT_DEBOUNCE_MS,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Поиск",
}: ListSearchFieldProps) {
  const [draft, setDraft] = useState(value);
  const [committed, setCommitted] = useState(value);
  const debouncedDraft = useDebounce(draft, debounceMs);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Внешний reset (URL / back): подтянуть draft к value.
  if (value !== committed) {
    setCommitted(value);
    setDraft(value);
  }

  useEffect(() => {
    const next = debouncedDraft.trim();
    if (next === value.trim()) return;
    onSearchRef.current(next);
  }, [debouncedDraft, value]);

  return (
    <Input
      className={cn("max-w-xs", className)}
      placeholder={placeholder}
      value={draft}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const next = draft.trim();
        if (next === value.trim()) return;
        onSearchRef.current(next);
      }}
    />
  );
}
