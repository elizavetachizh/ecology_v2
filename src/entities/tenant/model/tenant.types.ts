export type Tenant = {
  id: string;
  realm: string;
  name: string;
  short: string;
  parent_id: string | null;
  children: Tenant[];
};
