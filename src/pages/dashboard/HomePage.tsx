import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { HomeSearch } from "../../app/router/search-params";
import { useTenant } from "../../entities/tenant";
import {
  currentCalendarYear,
  DEFAULT_DASHBOARD_MONTHS,
  firstBurialPermitSelection,
  firstDashboardSelection,
  firstFormedSelection,
  useDashboardBalanceQuery,
  useDashboardBalanceStatQuery,
  useDashboardBurialPermitStatQuery,
  useDashboardBurialPermitsQuery,
  useDashboardFormedQuery,
  useDashboardFormedStatQuery,
  yearFromIsoDate,
} from "../../entities/waste/dashboards";
import {
  DashboardBalanceChart,
  DashboardBalanceTable,
  DashboardBurialFilters,
  DashboardBurialPermitChart,
  DashboardBurialPermitTable,
  DashboardFilters,
  DashboardFormedCharts,
  DashboardFormedFilters,
  DashboardFormedTable,
  DashboardSection,
} from "../../features/waste/view-dashboard";
import { routes } from "../../shared/config/routes";
import { TenantRequiredGate } from "../../shared/ui";
import { todayIsoDate } from "../../shared/lib/format-date";

export function HomePage() {
  const { activeTenantId } = useTenant();
  const navigate = useNavigate({ from: routes.home });
  const search = useSearch({ from: routes.home });

  const onDate = search.on_date ?? todayIsoDate();
  const months = search.months ?? DEFAULT_DASHBOARD_MONTHS;
  const year = search.year ?? yearFromIsoDate(onDate, currentCalendarYear());

  const { groups, loading, error } = useDashboardBalanceQuery({
    tenantId: activeTenantId,
    params: { on_date: onDate },
  });

  const fallback = useMemo(() => firstDashboardSelection(groups), [groups]);
  const unitId = search.unit_id ?? fallback?.unit_id;
  const wasteId = search.waste_id ?? fallback?.waste_id;
  const selected = Boolean(unitId && wasteId);

  const statQuery = useDashboardBalanceStatQuery({
    tenantId: activeTenantId,
    params: {
      on_date: onDate,
      unit_id: unitId ?? "",
      waste_id: wasteId ?? "",
      months,
    },
    enabled: selected,
  });

  const burialQuery = useDashboardBurialPermitsQuery({
    tenantId: activeTenantId,
    params: { year },
  });
  const burialFallback = useMemo(
    () => firstBurialPermitSelection(burialQuery.groups),
    [burialQuery.groups],
  );
  const permitId = search.permit_id ?? burialFallback?.permit_id;
  const permitWasteId = search.permit_waste_id ?? burialFallback?.waste_id;
  const burialSelected = Boolean(permitId && permitWasteId);

  const burialStatQuery = useDashboardBurialPermitStatQuery({
    tenantId: activeTenantId,
    params: {
      year,
      permit_id: permitId ?? "",
      waste_id: permitWasteId ?? "",
    },
    enabled: burialSelected,
  });

  const formedQuery = useDashboardFormedQuery({
    tenantId: activeTenantId,
    params: { year },
  });
  const formedFallback = useMemo(
    () => firstFormedSelection(formedQuery.groups),
    [formedQuery.groups],
  );
  const formedWasteId = search.formed_waste_id ?? formedFallback?.waste_id;
  const formedSelected = Boolean(formedWasteId);

  const formedStatQuery = useDashboardFormedStatQuery({
    tenantId: activeTenantId,
    params: {
      year,
      waste_id: formedWasteId ?? "",
    },
    enabled: formedSelected,
  });

  const patchSearch = (patch: Partial<HomeSearch>) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      title="Выберите организацию"
      description="Чтобы увидеть остатки отходов, выберите организацию в верхней панели."
    >
      <div className="space-y-8">
        <DashboardSection
          error={error}
          errorTitle="Не удалось загрузить остатки"
          title="Остатки отходов"
          description="Снимок на выбранную дату. Нажмите строку, чтобы открыть динамику."
          actions={
            <DashboardFilters
              values={{ on_date: onDate }}
              onChange={(patch) => patchSearch(patch)}
            />
          }
          table={
            <DashboardBalanceTable
              groups={groups}
              loading={loading}
              selectedUnitId={unitId}
              selectedWasteId={wasteId}
              onSelect={(selection) => patchSearch(selection)}
            />
          }
          chart={
            <DashboardBalanceChart
              stat={statQuery.stat}
              loading={statQuery.loading}
              error={statQuery.error}
              months={months}
              selected={selected}
              onMonthsChange={(nextMonths) =>
                patchSearch({ months: nextMonths })
              }
            />
          }
        />

        <DashboardSection
          error={burialQuery.error}
          errorTitle="Не удалось загрузить разрешения"
          title="Захоронение"
          description="Факт вывоза на захоронение за год по разрешениям. Нажмите строку, чтобы открыть график по месяцам."
          actions={
            <DashboardBurialFilters
              values={{ year }}
              onChange={(patch) => patchSearch(patch)}
            />
          }
          table={
            <DashboardBurialPermitTable
              groups={burialQuery.groups}
              loading={burialQuery.loading}
              selectedPermitId={permitId}
              selectedWasteId={permitWasteId}
              onSelect={(selection) =>
                patchSearch({
                  permit_id: selection.permit_id,
                  permit_waste_id: selection.waste_id,
                })
              }
            />
          }
          chart={
            <DashboardBurialPermitChart
              stat={burialStatQuery.stat}
              loading={burialStatQuery.loading}
              error={burialStatQuery.error}
              selected={burialSelected}
            />
          }
        />

        <DashboardSection
          error={formedQuery.error}
          errorTitle="Не удалось загрузить образование отходов"
          title="Образование отходов"
          description="Сумма образования за год. Нажмите строку, чтобы открыть распределение по подразделениям и динамику по месяцам."
          actions={
            <DashboardFormedFilters
              values={{ year }}
              onChange={(patch) => patchSearch(patch)}
            />
          }
          table={
            <DashboardFormedTable
              rows={formedQuery.groups}
              loading={formedQuery.loading}
              selectedWasteId={formedWasteId}
              onSelect={(selection) =>
                patchSearch({ formed_waste_id: selection.waste_id })
              }
            />
          }
          chart={
            <DashboardFormedCharts
              stat={formedStatQuery.stat}
              loading={formedStatQuery.loading}
              error={formedStatQuery.error}
              selected={formedSelected}
            />
          }
        />
      </div>
    </TenantRequiredGate>
  );
}
