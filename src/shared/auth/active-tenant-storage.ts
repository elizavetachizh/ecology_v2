const STORAGE_KEY_PREFIX = "eco.activeTenantId.";

export function activeTenantStorageKey(realm: string): string {
  return `${STORAGE_KEY_PREFIX}${realm}`;
}

function readKey(storage: Storage, key: string): string | null {
  try {
    const value = storage.getItem(key);
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

function writeKey(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // Quota / private mode — выбор останется в URL этой вкладки.
  }
}

function removeKey(storage: Storage, key: string): void {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

function clearPrefixedKeys(storage: Storage): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      storage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

function hasStorage(name: "localStorage" | "sessionStorage"): boolean {
  return typeof globalThis[name] !== "undefined";
}

export function readActiveTenantId(realm: string): string | null {
  if (!realm) return null;
  const key = activeTenantStorageKey(realm);
  if (hasStorage("localStorage")) {
    const fromLocal = readKey(localStorage, key);
    if (fromLocal) return fromLocal;
  }
  if (!hasStorage("sessionStorage")) return null;
  const fromSession = readKey(sessionStorage, key);
  if (!fromSession) return null;
  if (hasStorage("localStorage")) {
    writeKey(localStorage, key, fromSession);
    removeKey(sessionStorage, key);
  }
  return fromSession;
}

export function writeActiveTenantId(realm: string, tenantId: string): void {
  if (!realm || !tenantId || !hasStorage("localStorage")) return;
  writeKey(localStorage, activeTenantStorageKey(realm), tenantId);
}

export function clearActiveTenantId(realm: string): void {
  if (!realm) return;
  const key = activeTenantStorageKey(realm);
  if (hasStorage("localStorage")) removeKey(localStorage, key);
  if (hasStorage("sessionStorage")) removeKey(sessionStorage, key);
}

/** Очистка всех сохранённых org при logout (все realm на этом origin). */
export function clearAllActiveTenantIds(): void {
  if (hasStorage("localStorage")) clearPrefixedKeys(localStorage);
  if (hasStorage("sessionStorage")) clearPrefixedKeys(sessionStorage);
}
