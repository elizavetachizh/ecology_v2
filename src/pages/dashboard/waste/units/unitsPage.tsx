import { useMemo } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  TenantRequiredGate,
} from "../../../../shared/ui";
import { useTenant } from "../../../../entities/tenant";
import { useDeleteUnit } from "./list/model/use-delete-unit";
import { useUnitsPageData } from "./list/model/use-units-page-data";
import { useUnitsPageSearch } from "./list/model/use-units-page-search";
import { unitsColumns } from "./list/units-columns";
import { DeleteUnitDialog } from "./list/ui/DeleteUnitDialog";
import { UnitsPageHeader } from "./list/ui/UnitsPageHeader";
import { UnitsTable } from "./list/ui/UnitsTable";
import { UnitsToolbar } from "./list/ui/UnitsToolbar";

export function UnitsPage() {
  const { activeTenantId } = useTenant();
  const {
    search,
    pod9Only,
    sorting,
    focusId,
    patchSearch,
    onSortingChange,
    openCreateUnit,
  } = useUnitsPageSearch();

  const { mode, rows, loading, error, pagination, expanded, setExpanded } =
    useUnitsPageData({
      tenantId: activeTenantId,
      search,
      pod9Only,
    });

  const deleteUnit = useDeleteUnit();

  const columns = useMemo(
    () =>
      unitsColumns(
        {
          onCreateChild: (unitId) => openCreateUnit(unitId),
          onCreatePod9: (unitId) => openCreateUnit(unitId, { isPod9: true }),
          onDelete: deleteUnit.setDeletingUnit,
        },
        { hierarchical: mode === "tree" },
      ),
    [openCreateUnit, deleteUnit.setDeletingUnit, mode],
  );

  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить структуру</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      resourceLabel="структуры организации"
    >
      <div className="space-y-4">
        <UnitsPageHeader onCreateRoot={() => openCreateUnit()} />
        <UnitsToolbar
          query={search.q ?? ""}
          pod9Only={pod9Only}
          onSearch={(q) => patchSearch({ q })}
          onPod9OnlyChange={(checked) =>
            patchSearch({ is_pod9: checked ? true : undefined })
          }
        />
        <UnitsTable
          mode={mode}
          columns={columns}
          rows={rows}
          loading={loading}
          sorting={sorting}
          onSortingChange={onSortingChange}
          focusId={focusId}
          expanded={expanded}
          onExpandedChange={setExpanded}
          pagination={pagination}
          onOffsetChange={(offset) => patchSearch({ offset })}
          searchQuery={search.q}
        />
        <DeleteUnitDialog
          unit={deleteUnit.deletingUnit}
          confirmDisabled={deleteUnit.isPending}
          onOpenChange={(open) => {
            if (!open) deleteUnit.close();
          }}
          onConfirm={() => void deleteUnit.confirm()}
        />
      </div>
    </TenantRequiredGate>
  );
}
