export type CurrentUser = {
  id: number;
  realm: string;
  uuid: string;
  username: string;
  email: string | null;
  roles: string[];
  issuer: string;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
};
