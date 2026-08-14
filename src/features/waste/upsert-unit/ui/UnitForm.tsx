import { useDefaultParentTerritory } from "../model/use-default-parent-territory";
import type { UnitFormProps } from "./unit-form.types";
import { UnitFormFields } from "./UnitFormFields";

export type { UnitFormProps } from "./unit-form.types";

/**
 * Оболочка create/edit единицы:
 * — при create с parentId дожидается родителя и наследует territory;
 * — поля формы в UnitFormFields.
 */
export function UnitForm({
  mode,
  unitId,
  defaultParentId,
  defaultIsPod9 = false,
  activeTenantId,
  initial,
  onSaved,
  onCancel,
  eyebrow,
  actions,
}: UnitFormProps) {
  const defaultParent = useDefaultParentTerritory({
    tenantId: activeTenantId,
    parentId: defaultParentId,
    enabled: mode === "create",
  });

  if (defaultParent.loading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  return (
    <UnitFormFields
      key={mode === "create" ? defaultParent.formKey : `edit-${unitId}`}
      mode={mode}
      unitId={unitId}
      defaultParentId={defaultParentId}
      defaultIsPod9={defaultIsPod9}
      defaultRegionId={defaultParent.territory?.regionId}
      defaultDistrictId={defaultParent.territory?.districtId}
      defaultTerritoryLabels={defaultParent.territory?.labels}
      activeTenantId={activeTenantId}
      initial={initial}
      onSaved={onSaved}
      onCancel={onCancel}
      eyebrow={eyebrow}
      actions={actions}
    />
  );
}
