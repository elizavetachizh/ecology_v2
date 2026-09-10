import {
  HAZARD_CLASS_LABEL,
  HazardClassValues,
  PHYSICAL_STATE_LABEL,
  PhysicalStateValues,
  type HazardClass,
  type PhysicalState,
} from "../../../../../entities/waste/wastes";
import { ListSearchField, Select } from "../../../../../shared/ui";

type WastesFiltersValue = {
  q?: string;
  hazard_class?: HazardClass;
  physical_state?: PhysicalState;
};

type WastesFiltersProps = {
  values: WastesFiltersValue;
  onChange: (patch: WastesFiltersValue) => void;
};

export function WastesFilters({ values, onChange }: WastesFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ListSearchField
        value={values.q ?? ""}
        placeholder="Поиск по коду или названию"
        onSearch={(q) => onChange({ q: q || undefined })}
      />
      <Select
        aria-label="Фильтр по классу опасности"
        className="w-56"
        value={values.hazard_class ?? ""}
        onChange={(e) =>
          onChange({
            hazard_class: (e.target.value || undefined) as
              HazardClass | undefined,
          })
        }
      >
        <option value="">Все классы опасности</option>
        {HazardClassValues.map((value) => (
          <option key={value} value={value}>
            {HAZARD_CLASS_LABEL[value]}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Фильтр по агрегатному состоянию"
        className="w-48"
        value={values.physical_state ?? ""}
        onChange={(e) =>
          onChange({
            physical_state: (e.target.value || undefined) as
              PhysicalState | undefined,
          })
        }
      >
        <option value="">Все состояния</option>
        {PhysicalStateValues.map((value) => (
          <option key={value} value={value}>
            {PHYSICAL_STATE_LABEL[value]}
          </option>
        ))}
      </Select>
    </div>
  );
}
