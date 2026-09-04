/** Ключ = keyword тенанта, значение — роли (`editor`, `user`, …). */
export type UserRoles = Record<string, string[]>;

export type CurrentUser = {
  id: string;
  realm: string;
  uuid: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  roles: UserRoles;
  beltopgas_uuid: string | null;
  issuer: string;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};
