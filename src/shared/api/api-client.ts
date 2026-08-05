import { forceRefreshAccessToken, refreshAccessToken } from "../auth/token-refresh";
import { getAppEnv } from "../config/env";

export type ApiErrorCode =
  | "refresh_failed"
  | "token_rejected"
  | "forbidden"
  | "bad_request"
  | "http_error";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(message: string, status: number, code: ApiErrorCode) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ApiRequestOptions = RequestInit & {
  tenantScoped?: boolean;
  
};

type TenantIdResolver = () => string | null;
type UnauthorizedHandler = (error: ApiError) => void | Promise<void>;

let resolveTenantId: TenantIdResolver = () => null;
let handleUnauthorized: UnauthorizedHandler = () => undefined;
let unauthorizedNotification: Promise<void> | null = null;

export function setTenantIdResolver(resolver: TenantIdResolver) {
  resolveTenantId = resolver;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  handleUnauthorized = handler;
}

async function notifyUnauthorized(error: ApiError) {
  if (!unauthorizedNotification) {
    unauthorizedNotification = Promise.resolve(handleUnauthorized(error)).finally(
      () => {
        unauthorizedNotification = null;
      },
    );
  }
  await unauthorizedNotification;
}

function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getAppEnv().apiBaseUrl}${normalizedPath}`;
}

async function sendRequest(
  path: string,
  options: ApiRequestOptions,
  token: string,
): Promise<Response> {
  const { tenantScoped = false, ...requestInit } = options;
  const headers = new Headers(requestInit.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (tenantScoped) {
    const tenantId = resolveTenantId();
    if (!tenantId) {
      throw new ApiError("Не выбран активный tenant", 400, "bad_request");
    }
    headers.set("X-Tenant-Id", tenantId);
  } else {
    headers.delete("X-Tenant-Id");
  }

  return fetch(buildUrl(path), {
    ...requestInit,
    headers,
  });
}

export async function apiFetch(
  path: string,
  options: ApiRequestOptions = {},
): Promise<Response> {
  let token: string;
  try {
    token = await refreshAccessToken(30);
  } catch {
    const error = new ApiError(
      "Не удалось обновить сессию Keycloak",
      401,
      "refresh_failed",
    );
    await notifyUnauthorized(error);
    throw error;
  }

  let response = await sendRequest(path, options, token);

  if (response.status === 401) {
    try {
      const refreshedToken = await forceRefreshAccessToken();
      response = await sendRequest(path, options, refreshedToken);
    } catch {
      const error = new ApiError(
        "Не удалось обновить сессию Keycloak",
        401,
        "refresh_failed",
      );
      await notifyUnauthorized(error);
      throw error;
    }

    if (response.status === 401) {
      const error = new ApiError(
        "Backend отклонил access token",
        401,
        "token_rejected",
      );
      await notifyUnauthorized(error);
      throw error;
    }
  }

  if (response.status === 403) {
    throw new ApiError(
      "Недостаточно прав для выполнения операции",
      403,
      "forbidden",
    );
  }
  if (!response.ok) {
    throw new ApiError(
      `Сервер вернул ошибку ${response.status}`,
      response.status,
      "http_error",
    );
  }
  return response;
}

export async function apiJson<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await apiFetch(path, options);
  return response.json() as Promise<T>;
}
