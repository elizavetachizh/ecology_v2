import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthClaims, AuthStatus } from "../../../shared/auth/auth.types";
import {
  ApiError,
  setUnauthorizedHandler,
} from "../../../shared/api/api-client";
import {
  getKeycloak,
  initializeKeycloak,
  resetKeycloakInitialization,
} from "../../../shared/auth/keycloak";
import { refreshAccessToken } from "../../../shared/auth/token-refresh";
import { Button } from "../../../shared/ui";
import { AuthContext } from "../../../shared/auth/auth-context";

type AuthProviderProps = {
  children: ReactNode;
  onSessionInvalidated: () => void | Promise<void>;
};

function messageForAuthFailure(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === "refresh_failed") {
      return "Не удалось обновить сессию Keycloak. Выполните вход повторно.";
    }
    if (error.code === "token_rejected") {
      return "Backend отклонил access token. Проверьте конфигурацию Keycloak и API.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Ошибка авторизации";
}

function AuthLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <p className="text-sm text-muted-foreground">Проверка сессии…</p>
    </div>
  );
}

function AuthErrorScreen({
  error,
  onRetry,
  onLogin,
}: {
  error: Error;
  onRetry: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-card p-6">
        <h1 className="text-lg font-semibold">Не удалось выполнить вход</h1>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <div className="flex gap-2">
          <Button onClick={onRetry}>Повторить</Button>
          <Button variant="outline" onClick={onLogin}>
            Войти снова
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AuthProvider({
  children,
  onSessionInvalidated,
}: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [claims, setClaims] = useState<AuthClaims>();
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const failureHandledRef = useRef(false);

  const enterAuthError = useCallback(
    async (reason: unknown) => {
      if (failureHandledRef.current) return;
      failureHandledRef.current = true;
      setClaims(undefined);
      setError(new Error(messageForAuthFailure(reason)));
      setStatus("error");
      await onSessionInvalidated();
    },
    [onSessionInvalidated],
  );

  useEffect(() => {
    let active = true;
    failureHandledRef.current = false;
    const client = getKeycloak();

    const syncAuthenticatedState = () => {
      if (!active) return;
      failureHandledRef.current = false;
      setClaims(client.tokenParsed as AuthClaims | undefined);
      setError(null);
      setStatus(client.authenticated ? "authenticated" : "unauthenticated");
    };

    setUnauthorizedHandler((apiError) => {
      if (!active) return;
      return enterAuthError(apiError);
    });

    client.onAuthSuccess = syncAuthenticatedState;
    client.onAuthRefreshSuccess = syncAuthenticatedState;
    client.onAuthError = (authError) => {
      if (!active) return;
      void enterAuthError(
        new Error(`Ошибка авторизации: ${String(authError)}`),
      );
    };
    client.onAuthRefreshError = () => {
      void enterAuthError(
        new ApiError(
          "Не удалось обновить сессию Keycloak",
          401,
          "refresh_failed",
        ),
      );
    };
    client.onAuthLogout = () => {
      if (!active) return;
      failureHandledRef.current = true;
      setClaims(undefined);
      setStatus("unauthenticated");
      void onSessionInvalidated();
    };
    client.onTokenExpired = () => {
      if (!active || failureHandledRef.current) return;
      setStatus("refreshing");
      void refreshAccessToken()
        .then(syncAuthenticatedState)
        .catch((reason) => enterAuthError(reason));
    };

    void initializeKeycloak()
      .then((authenticated) => {
        if (!active) return;
        if (!authenticated) {
          setStatus("unauthenticated");
          return client.login();
        }
        syncAuthenticatedState();
      })
      .catch((reason: unknown) => {
        if (!active) return;
        void enterAuthError(
          reason instanceof Error
            ? reason
            : new Error("Не удалось инициализировать Keycloak"),
        );
      });

    const handleVisibilityChange = () => {
      if (
        document.visibilityState !== "visible" ||
        !client.authenticated ||
        failureHandledRef.current
      ) {
        return;
      }
      void refreshAccessToken().catch((reason) => enterAuthError(reason));
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      setUnauthorizedHandler(() => undefined);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attempt, enterAuthError, onSessionInvalidated]);

  const retry = useCallback(() => {
    failureHandledRef.current = false;
    resetKeycloakInitialization();
    setError(null);
    setStatus("initializing");
    setAttempt((value) => value + 1);
  }, []);

  const login = useCallback(() => getKeycloak().login({ prompt: "login" }), []);
  const value = useMemo(
    () => ({
      status,
      authenticated: status === "authenticated" || status === "refreshing",
      claims,
      error,
      login,
      retry,
    }),
    [claims, error, login, retry, status],
  );

  if (status === "initializing") return <AuthLoadingScreen />;
  if (status === "error" && error) {
    return (
      <AuthErrorScreen
        error={error}
        onRetry={retry}
        onLogin={() => void login()}
      />
    );
  }
  if (status === "unauthenticated") return <AuthLoadingScreen />;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
