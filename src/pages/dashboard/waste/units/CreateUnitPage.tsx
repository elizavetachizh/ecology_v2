import { useNavigate, useSearch } from "@tanstack/react-router";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { useTenant } from "../../../../entities/tenant";
import { UnitForm } from "../../../../features/waste/upsert-unit";
import { UnitInstructionWastesCreateHint } from "../../../../features/waste/bind-unit-instruction-waste";

export function CreateUnitPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();
  const { parentId, isPod9 } = useSearch({
    from: "/directories/units/new",
  });

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description={
        "Создание структурной единицы доступно после выбора организации в верхней панели."
      }
    >
      <div className="space-y-6">
        <UnitForm
          mode="create"
          activeTenantId={activeTenantId}
          defaultParentId={parentId || undefined}
          defaultIsPod9={Boolean(isPod9)}
          onSaved={(unit, { close }) => {
            toast.success(
              unit.is_pod9
                ? "Журнал ПОД-9 успешно создан"
                : "Единица успешно создана",
            );
            // После создания ПОД-9 всегда открываем карточку с привязками отходов.
            if (unit.is_pod9) {
              void navigate({
                to: "/directories/units/$unitId",
                params: { unitId: unit.id },
                search: { instructionId: undefined },
                replace: true,
              });
              return;
            }
            if (close) {
              void navigate({
                to: "/directories/units",
                search: {
                  focusId: unit.id,
                  expandId: unit.parent_id ?? undefined,
                },
              });
              return;
            }
            void navigate({
              to: "/directories/units/$unitId",
              params: { unitId: unit.id },
              search: { instructionId: undefined },
              replace: true,
            });
          }}
          onCancel={() => void navigate({ to: "/directories/units" })}
        />

        {isPod9 ? <UnitInstructionWastesCreateHint /> : null}
      </div>
    </TenantRequiredGate>
  );
}
