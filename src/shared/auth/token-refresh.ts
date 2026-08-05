import type Keycloak from "keycloak-js";
import { getKeycloak } from "./keycloak";

let inFlightRefresh: Promise<string> | null = null;

export async function refreshAccessToken(
  minValidity = 30,
  client: Keycloak = getKeycloak(),
): Promise<string> {
  if (inFlightRefresh) return inFlightRefresh;

  inFlightRefresh = (async () => {
    if (!client.authenticated) {
      throw new Error("Пользователь не аутентифицирован");
    }

    await client.updateToken(minValidity);
    if (!client.token) {
      throw new Error("Keycloak не вернул access token");
    }
    return client.token;
  })();

  try {
    return await inFlightRefresh;
  } finally {
    inFlightRefresh = null;
  }
}

export function forceRefreshAccessToken(client?: Keycloak): Promise<string> {
  return refreshAccessToken(-1, client);
}
