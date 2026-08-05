export type AppEnv = {
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  appUrl: string;
  apiBaseUrl: string;
};

function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]?.trim();
  if (!value) {
    throw new Error(`Не задана обязательная переменная окружения ${name}`);
  }
  return value.replace(/\/+$/, "");
}

export function parseRealmHostMap(value: string | undefined): Map<string, string> {
  const result = new Map<string, string>();
  if (!value?.trim()) return result;

  for (const entry of value.split(",")) {
    const [rawHost, rawRealm, ...rest] = entry.split("=");
    const host = rawHost?.trim().toLowerCase();
    const realm = rawRealm?.trim();
    if (!host || !realm || rest.length > 0) {
      throw new Error(
        "VITE_KEYCLOAK_REALM_HOST_MAP должен иметь формат host=realm,host=realm",
      );
    }
    result.set(host, realm);
  }

  return result;
}

export function resolveRealm(options: {
  isDev: boolean;
  hostname: string;
  pathname?: string;
  developmentRealm: string;
  hostMap?: string;
}): string {
  if (options.isDev) return options.developmentRealm;

  const host = options.hostname.toLowerCase();
  const pathname = options.pathname ?? "/";
  const mapping = parseRealmHostMap(options.hostMap);
  const pathMatch = [...mapping.entries()]
    .filter(([key]) => key.startsWith(`${host}/`))
    .sort(([left], [right]) => right.length - left.length)
    .find(([key]) => {
      const prefix = key.slice(host.length);
      return pathname === prefix || pathname.startsWith(`${prefix}/`);
    });
  const realm = pathMatch?.[1] ?? mapping.get(host);
  if (!realm) {
    throw new Error(
      `Для host "${options.hostname}" не настроено доверенное соответствие realm`,
    );
  }
  return realm;
}

let cachedEnv: AppEnv | undefined;

export function getAppEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const developmentRealm = required("VITE_KEYCLOAK_REALM");
  cachedEnv = {
    keycloakUrl: required("VITE_KEYCLOAK_URL"),
    keycloakRealm: resolveRealm({
      isDev: import.meta.env.DEV,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      developmentRealm,
      hostMap: import.meta.env.VITE_KEYCLOAK_REALM_HOST_MAP,
    }),
    keycloakClientId: required("VITE_KEYCLOAK_CLIENT_ID"),
    appUrl: required("VITE_APP_URL"),
    apiBaseUrl: required("VITE_API_BASE_URL"),
  };

  return cachedEnv;
}
