import Keycloak from "keycloak-js";
import { getAppEnv } from "../config/env";

let keycloak: Keycloak | undefined;
let initialization: Promise<boolean> | undefined;

export function getKeycloak(): Keycloak {
  if (!keycloak) {
    const env = getAppEnv();
    keycloak = new Keycloak({
      url: env.keycloakUrl,
      realm: env.keycloakRealm,
      clientId: env.keycloakClientId,
    });
  }
  return keycloak;
}

export function initializeKeycloak(): Promise<boolean> {
  if (!initialization) {
    initialization = getKeycloak().init({
      onLoad: "login-required",
      pkceMethod: "S256",
      checkLoginIframe: false,
    });
  }
  return initialization;
}

export function resetKeycloakInitialization() {
  initialization = undefined;
  keycloak = undefined;
}
