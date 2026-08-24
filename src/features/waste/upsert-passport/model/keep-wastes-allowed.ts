export function keepWastesAllowed(
  selected: string[],
  allowedIds: ReadonlySet<string>,
): { kept: string[]; dropped: string[] } {
  const kept: string[] = [];
  const dropped: string[] = [];
  for (const id of selected) {
    if (allowedIds.has(id)) kept.push(id);
    else dropped.push(id);
  }
  return { kept, dropped };
}

/** `allowedIds === null` — договор ещё не загружен, выбор не трогаем. */
export function syncPassportWastes(
  selected: string[],
  allowedIds: readonly string[] | null,
): { kept: string[]; dropped: string[]; conflict: boolean } {
  if (allowedIds === null) {
    return { kept: selected, dropped: [], conflict: false };
  }
  const { kept, dropped } = keepWastesAllowed(selected, new Set(allowedIds));
  return { kept, dropped, conflict: dropped.length > 0 };
}
