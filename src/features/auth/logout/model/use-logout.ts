import { useCallback, useState } from "react";
import { getKeycloak } from "../../../../shared/auth/keycloak";
import { getAppEnv } from "../../../../shared/config/env";
import { clearSessionState } from "../../../../shared/auth/cleanup-session";

export function useLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await clearSessionState();
      await getKeycloak().logout({
        redirectUri: getAppEnv().appUrl,
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut]);

  return { logout, isLoggingOut };
}
