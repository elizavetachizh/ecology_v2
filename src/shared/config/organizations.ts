export type OrganizationOption = {
  id: string;
  name: string;
  subtitle: string;
};

export const ORGANIZATIONS: OrganizationOption[] = [
  {
    id: "org-1",
    name: "Аппарат управления",
    subtitle: "Головная организация",
  },
  {
    id: "org-2",
    name: "Завод №1",
    subtitle: "Производственная площадка",
  },
  {
    id: "org-3",
    name: "Складской комплекс",
    subtitle: "Логистика",
  },
];
