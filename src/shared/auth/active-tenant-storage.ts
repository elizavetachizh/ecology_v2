const STORAGE_KEY_PREFIX = "eco.activeTenantId.";

export function activeTenantStorageKey(realm: string): string {
  return `${STORAGE_KEY_PREFIX}${realm}`;
}

export function readActiveTenantId(realm: string): string | null {
  if (!realm || typeof sessionStorage === "undefined") return null;
  try {
    const value = sessionStorage.getItem(activeTenantStorageKey(realm));
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

export function writeActiveTenantId(realm: string, tenantId: string): void {
  if (!realm || !tenantId || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(activeTenantStorageKey(realm), tenantId);
  } catch {
    // Quota / private mode — выбор останется только в памяти до следующего reload.
  }
}

export function clearActiveTenantId(realm: string): void {
  if (!realm || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(activeTenantStorageKey(realm));
  } catch {
    // ignore
  }
}

/** Очистка всех сохранённых org при logout (все realm на этом origin). */
export function clearAllActiveTenantIds(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}
