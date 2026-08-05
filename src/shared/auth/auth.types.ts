import type { KeycloakTokenParsed } from "keycloak-js";

export type AuthStatus =
  | "initializing"
  | "authenticated"
  | "unauthenticated"
  | "refreshing"
  | "error";

export type AuthClaims = KeycloakTokenParsed & {
  email?: string;
  name?: string;
  preferred_username?: string;
  realm_access?: {
    roles?: string[];
  };
};

export type AuthContextValue = {
  status: AuthStatus;
  authenticated: boolean;
  claims: AuthClaims | undefined;
  roles: readonly string[];
  error: Error | null;
  login: () => Promise<void>;
  retry: () => void;
};
