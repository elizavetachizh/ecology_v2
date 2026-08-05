export type CurrentUser = {
  id: number;
  realm: string;
  uuid: string;
  username: string;
  email: string | null;
  roles: string[];
  issuer: string;
};
