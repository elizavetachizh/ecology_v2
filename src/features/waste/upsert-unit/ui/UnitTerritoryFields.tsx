import type { Control, FieldErrors } from "react-hook-form";
import { Controller } from "react-hook-form";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../../../../shared/ui";
import { DistrictClassifierSelect } from "../../select-district-classifier";
import { RegionClassifierSelect } from "../../select-region-classifier";
import type { TerritoryLabels } from "../model/territory-from-parent";
import type { UnitFormValues } from "../model/unit-form.schema";

type UnitTerritoryFieldsProps = {
  control: Control<UnitFormValues>;
  errors: FieldErrors<UnitFormValues>;
  regionId?: number;
  labels: TerritoryLabels;
  onRegionChange: (region: { id: number; name: string } | null) => void;
  onDistrictChange: (district: { id: number; name: string } | null) => void;
};

export function UnitTerritoryFields({
  control,
  errors,
  regionId,
  labels,
  onRegionChange,
  onDistrictChange,
}: UnitTerritoryFieldsProps) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor="region_id">Регион</FieldLabel>
        <Controller
          name="region_id"
          control={control}
          render={({ field }) => (
            <RegionClassifierSelect
              value={field.value != null ? String(field.value) : ""}
              selectedLabel={labels.region}
              onChange={(item) => {
                field.onChange(item?.id);
                onRegionChange(item);
              }}
            />
          )}
        />
        <FieldDescription>
          Выберите регион, чтобы открыть список районов. При выборе родителя
          подставляется автоматически; можно изменить вручную.
        </FieldDescription>
        <FieldError>{errors.region_id?.message}</FieldError>
      </Field>

      <Field>
        <FieldLabel htmlFor="district_id">Район</FieldLabel>
        {regionId != null ? (
          <Controller
            name="district_id"
            control={control}
            render={({ field }) => (
              <DistrictClassifierSelect
                region_id={regionId}
                value={field.value != null ? String(field.value) : ""}
                selectedLabel={labels.district}
                onChange={(item) => {
                  field.onChange(item?.id);
                  onDistrictChange(item);
                }}
              />
            )}
          />
        ) : (
          <div className="flex h-9 items-center rounded-md border border-dashed border-border px-3 text-sm text-muted-foreground">
            Сначала выберите регион
          </div>
        )}
        <FieldDescription>
          Район зависит от выбранного региона и сбрасывается при его смене.
        </FieldDescription>
        <FieldError>{errors.district_id?.message}</FieldError>
      </Field>
    </>
  );
}
