import {
  OPERATION_TYPE_LABEL,
  OperationTypeValues,
  type OperationType,
} from "../../../../../entities/waste/operations";
import { UnitHierarchicalSelect } from "../../../../../entities/waste/units";
import { WasteSelect } from "../../../../../entities/waste/wastes";
import {
  Button,
  DateFilterInput,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  Select,
} from "../../../../../shared/ui";
import { FileText } from "lucide-react";
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

export function OperationsFilters({
  tenantId,
  values,
  onChange,
}: OperationsFiltersProps) {
  const [pod9Open, setPod9Open] = useState(false);

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
        <div className="w-64">
          <UnitHierarchicalSelect
            tenantId={tenantId}
            value={values.unit_id ?? ""}
            isPod9={true}
            onChange={(unit) => onChange({ unit_id: unit?.id ?? undefined })}
          />
        </div>
        <div className="w-64">
          <WasteSelect
            tenantId={tenantId}
            placeholder="Выберите отход"
            aria-label="Фильтр по отходу"
            value={values.waste_id ?? ""}
            onChange={(id) => onChange({ waste_id: id || undefined })}
          />
        </div>

        <Select
          aria-label="Фильтр по типу операции"
          className="w-48"
          value={values.operation_type ?? ""}
          onChange={(e) =>
            onChange({
              operation_type: (e.target.value || undefined) as
                OperationType | undefined,
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
          <FileText className="size-3.5" />
          ПОД-9
        </Button>
      </div>

      <Modal open={pod9Open} onOpenChange={handlePod9OpenChange}>
        <ModalContent className="max-w-5xl ">
          <ModalHeader>
            <ModalTitle>ПОД-9</ModalTitle>
            <ModalDescription>
              Сформируйте ПОД-9 отчет для выбранного периода и единицы.
            </ModalDescription>
          </ModalHeader>
          <Pod9ReportForm key={tenantId} showPageHeader={false} />

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
