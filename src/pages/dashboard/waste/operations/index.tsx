import { useState } from "react";
import { Button, DataTable } from "../../../../shared/ui";
import {
  CreateOperationModal,
  OPERATION_TYPES,
  type CreateOperationForm,
} from "../../../../features/waste/create-operation";
import {
  findStructureNode,
  getStructureTree,
} from "../../directories/model/structure.store";
import {
  MOCK_OPERATIONS,
  type OperationRow,
} from "./model/operations.mock";
import { operationsColumns } from "./ui/operations-columns";

function mapFormToRow(form: CreateOperationForm): OperationRow {
  const unit = findStructureNode(getStructureTree(), form.unitId);

  const operationType = OPERATION_TYPES.find(
    (item) => item.id === form.operationTypeId,
  );

  return {
    id: `op-${crypto.randomUUID()}`,
    date: form.date,
    department: unit?.name ?? "—",
    facility: "—",
    waste:  "—",
    operationType: operationType?.name ?? "—",
    quantity: Number(form.quantity),
    unit: "",
    storagePlace: "—",
    document: "—",
    status: "draft",
  };
}

export function WasteOperationsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [operations, setOperations] = useState<OperationRow[]>(MOCK_OPERATIONS);

  const handleCreate = (data: CreateOperationForm) => {
    setOperations((prev) => [mapFormToRow(data), ...prev]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Журнал операций
          </h1>
          <p className="text-sm text-muted-foreground">
            Здесь вы можете просматривать и управлять операциями по отходам.
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Создать операцию
        </Button>
      </div>

      <DataTable
        columns={operationsColumns}
        data={operations}
        getRowId={(row) => row.id}
        emptyTitle="Пока нет операций"
        emptyDescription="Создайте первую операцию, чтобы начать учет отходов."
        getRowClassName={(row) =>
          row.original.status === "error"
            ? "bg-destructive-muted/40"
            : undefined
        }
      />

      <CreateOperationModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </div>
  );
}
