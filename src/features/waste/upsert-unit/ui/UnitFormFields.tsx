import {
  useUnitAncestorChain,
  type Unit,
} from "../../../../entities/waste/units";
import { useUpsertUnitForm } from "../model/use-upsert-unit-form";
import { useUnitTerritoryFields } from "../model/use-unit-territory-fields";
import type { UnitFormFieldsProps } from "./unit-form.types";
import { UnitFormActions } from "./UnitFormActions";
import { UnitFormHeader } from "./UnitFormHeader";
import { UnitIdentityFields } from "./UnitIdentityFields";
import { UnitTerritoryFields } from "./UnitTerritoryFields";

export function UnitFormFields({
  mode,
  unitId,
  defaultParentId,
  defaultIsPod9 = false,
  defaultRegionId,
  defaultDistrictId,
  defaultTerritoryLabels,
  activeTenantId,
  initial,
  onSaved,
  onCancel,
  eyebrow,
  actions,
}: UnitFormFieldsProps) {
  const { form, error, pending, onSubmit } = useUpsertUnitForm({
    mode,
    unitId,
    defaultParentId,
    defaultIsPod9,
    defaultRegionId,
    defaultDistrictId,
    initial,
    onSaved,
  });

  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const regionId = watch("region_id");
  const isPod9 = watch("is_pod9");
  const parentId = watch("parent_id");
  const ancestors = useUnitAncestorChain({
    tenantId: activeTenantId,
    unit: mode === "edit" ? initial : null,
    enabled: mode === "edit" && Boolean(initial?.parent_id),
  });
  const parentName =
    ancestors.items.length >= 2
      ? ancestors.items[ancestors.items.length - 2]?.name
      : null;
  const childCounts = directChildCounts(initial);
  const territory = useUnitTerritoryFields({
    setValue,
    defaultParentId,
    initialLabels:
      defaultTerritoryLabels ??
      (initial
        ? {
            region: initial.region?.name,
            district: initial.district?.name,
          }
        : undefined),
  });

  return (
    <form
      className="mx-auto max-w-4xl space-y-6"
      onSubmit={form.handleSubmit((values) => onSubmit(false, values))}
    >
      <UnitFormHeader
        mode={mode}
        defaultIsPod9={defaultIsPod9}
        isPod9={isPod9}
        unitName={initial?.name}
        parentId={initial?.parent_id}
        parentName={parentName}
        regionName={initial?.region?.name}
        districtName={initial?.district?.name}
        structuralCount={childCounts?.structural}
        accountingCount={childCounts?.accounting}
        eyebrow={eyebrow}
        actions={actions}
        error={error}
      />

      <div className="grid gap-4 items-start rounded-xl border border-border bg-card p-4 md:grid-cols-2">
        <UnitIdentityFields
          mode={mode}
          control={control}
          register={register}
          errors={errors}
          tenantId={activeTenantId}
          unitId={unitId}
          parentId={parentId}
          isPod9={isPod9}
          onParentChange={territory.inheritFromParent}
        />
        <UnitTerritoryFields
          control={control}
          errors={errors}
          regionId={regionId}
          labels={territory.labels}
          onRegionChange={territory.onRegionChange}
          onDistrictChange={territory.onDistrictChange}
        />
      </div>

      <UnitFormActions
        mode={mode}
        pending={pending}
        onSaveAndClose={() =>
          void form.handleSubmit((values) => onSubmit(true, values))()
        }
        onCancel={onCancel}
      />
    </form>
  );
}

function directChildCounts(unit: Unit | null | undefined): {
  structural: number;
  accounting: number;
} | null {
  if (!unit || !("children" in unit) || !Array.isArray(unit.children)) {
    return null;
  }

  let structural = 0;
  let accounting = 0;
  for (const child of unit.children) {
    if (child.is_pod9) accounting += 1;
    else structural += 1;
  }
  return { structural, accounting };
}
