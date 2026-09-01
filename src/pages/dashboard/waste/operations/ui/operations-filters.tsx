import { useQuery } from "@tanstack/react-query";
import {
  OPERATION_TYPE_LABEL,
  OperationTypeValues,
  type OperationType,
} from "../../../../../entities/waste/operations";
import {
  getUnit,
  unitsQueryKeys,
  useUnitsOptions,
  type Unit,
} from "../../../../../entities/waste/units";
import {
  getWaste,
  useWastesOptions,
  wasteLabel,
  wastesQueryKeys,
} from "../../../../../entities/waste/wastes";
import {
  AsyncCombobox,
  Button,
  DateFilterInput,
  Modal,
  ModalContent,
  ModalFooter,
  Select,
} from "../../../../../shared/ui";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Pod9ReportForm } from "../../../../../features/generate-report";

export type OperationsFiltersValue = {
  unit_id?: string;
  waste_id?: string;
  operation_type?: OperationType;
  date_from?: string;
  date_to?: string;
};

type OperationsFiltersProps = {
  tenantId: string | null;
  values: OperationsFiltersValue;
  onChange: (patch: OperationsFiltersValue) => void;
};

function unitLabel(unit: Pick<Unit, "name" | "short_name">) {
  return unit.short_name ? `${unit.name} (${unit.short_name})` : unit.name;
}

export function OperationsFilters({
  tenantId,
  values,
  onChange,
}: OperationsFiltersProps) {
  const [pod9Open, setPod9Open] = useState(false);
  const units = useUnitsOptions({
    tenantId,
    enabled: Boolean(tenantId),
  });
  const wastes = useWastesOptions({
    tenantId,
    enabled: Boolean(tenantId),
  });

  const selectedUnitQuery = useQuery({
    queryKey: unitsQueryKeys.detail(
      tenantId ?? "none",
      values.unit_id ?? "none",
    ),
    queryFn: ({ signal }) => getUnit(values.unit_id!, signal),
    enabled: Boolean(tenantId && values.unit_id),
  });
  const selectedWasteQuery = useQuery({
    queryKey: wastesQueryKeys.detail(
      tenantId ?? "none",
      values.waste_id ?? "none",
    ),
    queryFn: ({ signal }) => getWaste(values.waste_id!, signal),
    enabled: Boolean(tenantId && values.waste_id),
  });

  const selectedUnit =
    units.options.find((unit) => unit.id === values.unit_id) ??
    (selectedUnitQuery.data?.id === values.unit_id
      ? selectedUnitQuery.data
      : null);
  const selectedWaste =
    wastes.options.find((waste) => waste.id === values.waste_id) ??
    (selectedWasteQuery.data?.id === values.waste_id
      ? selectedWasteQuery.data
      : null);

  const handlePod9OpenChange = (nextOpen: boolean) => {
    setPod9Open(nextOpen);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">с</span>
          <DateFilterInput
            aria-label="Дата с"
            value={values.date_from}
            onValueChange={(date_from) => onChange({ date_from })}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-muted-foreground">по</span>
          <DateFilterInput
            aria-label="Дата по"
            value={values.date_to}
            onValueChange={(date_to) => onChange({ date_to })}
          />
        </div>
        <AsyncCombobox
          options={units.options.map((unit) => ({
            value: unit.id,
            label: unitLabel(unit),
          }))}
          value={values.unit_id ?? ""}
          selectedLabel={selectedUnit ? unitLabel(selectedUnit) : undefined}
          onValueChange={(id) => onChange({ unit_id: id || undefined })}
          placeholder="Все структурные единицы"
          searchPlaceholder="Поиск по названию или краткому"
          emptyMessage={units.loading ? "Загрузка…" : "Ничего не найдено"}
          search={units.search}
          setSearch={units.setSearch}
          className="w-64"
          aria-label="Фильтр по структурной единице"
        />
        <AsyncCombobox
          options={wastes.options.map((waste) => ({
            value: waste.id,
            label: wasteLabel(waste),
          }))}
          value={values.waste_id ?? ""}
          selectedLabel={selectedWaste ? wasteLabel(selectedWaste) : undefined}
          onValueChange={(id) => onChange({ waste_id: id || undefined })}
          placeholder="Все отходы"
          searchPlaceholder="Поиск по коду или названию"
          emptyMessage={wastes.loading ? "Загрузка…" : "Ничего не найдено"}
          search={wastes.search}
          setSearch={wastes.setSearch}
          className="w-72"
          aria-label="Фильтр по отходу"
        />
        <Select
          aria-label="Фильтр по типу операции"
          className="w-48"
          value={values.operation_type ?? ""}
          onChange={(e) =>
            onChange({
              operation_type: (e.target.value || undefined) as
                | OperationType
                | undefined,
            })
          }
        >
          <option value="">Все типы</option>
          {OperationTypeValues.map((type) => (
            <option key={type} value={type}>
              {OPERATION_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        <Button type="button" size="sm" onClick={() => setPod9Open(true)}>
          <Plus className="size-3.5" />
          ПОД-9
        </Button>
      </div>

      <Modal open={pod9Open} onOpenChange={handlePod9OpenChange}>
        <ModalContent className="max-w-5xl ">
          <Pod9ReportForm key={tenantId} />

          <ModalFooter className="border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPod9Open(false)}
            >
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
