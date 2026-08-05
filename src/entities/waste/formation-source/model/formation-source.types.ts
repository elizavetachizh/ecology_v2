export type FormationSource = {
  id: string;
  name: string;
};

export type FormationSourceFormValues = {
  name: string;
};

export function emptyFormationSourceForm(): FormationSourceFormValues {
  return { name: "" };
}
