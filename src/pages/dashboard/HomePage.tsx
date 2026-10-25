import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { HomeSearch } from "../../app/router/search-params";
import { useTenant } from "../../entities/tenant";
import {
  currentCalendarYear,
  DEFAULT_DASHBOARD_MONTHS,
  DEFAULT_SUMMARY_PRESET,
  firstBurialPermitSelection,
  firstDashboardSelection,
  firstFormedSelection,
  resolveSummaryRange,
  summaryPresetRange,
  useDashboardBalanceQuery,
  useDashboardBalanceStatQuery,
  useDashboardBurialPermitStatQuery,
  useDashboardBurialPermitsQuery,
  useDashboardFormedQuery,
  useDashboardFormedStatQuery,
  useDashboardSummaryQuery,
  type SummaryPreset,
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
  DashboardSummarySection,
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
  const burialYear = search.burial_year ?? currentCalendarYear();
  const formedYear = search.formed_year ?? currentCalendarYear();
  const summaryPreset = search.summary_preset ?? DEFAULT_SUMMARY_PRESET;
  const summaryRange = resolveSummaryRange(
    summaryPreset,
    search.summary_from,
    search.summary_to,
  );

  const summaryQuery = useDashboardSummaryQuery({
    tenantId: activeTenantId,
    params: {
      date_from: summaryRange.date_from ?? "",
      date_to: summaryRange.date_to ?? "",
    },
    enabled: summaryRange.error === null,
  });

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
    params: { year: burialYear },
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
      year: burialYear,
      permit_id: permitId ?? "",
      waste_id: permitWasteId ?? "",
    },
    enabled: burialSelected,
  });

  const formedQuery = useDashboardFormedQuery({
    tenantId: activeTenantId,
    params: { year: formedYear },
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
      year: formedYear,
      waste_id: formedWasteId ?? "",
    },
    enabled: formedSelected,
  });

  const patchSearch = (patch: Partial<HomeSearch>) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
    });
  };

  const selectSummaryPreset = (preset: SummaryPreset) => {
    if (preset === "custom") {
      const seeded =
        summaryPreset === "custom"
          ? {
              date_from: search.summary_from,
              date_to: search.summary_to,
            }
          : summaryPresetRange(summaryPreset);
      patchSearch({
        summary_preset: preset,
        summary_from: seeded.date_from,
        summary_to: seeded.date_to,
      });
      return;
    }
    patchSearch({
      summary_preset: preset,
      summary_from: undefined,
      summary_to: undefined,
    });
  };

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      title="Выберите организацию"
      description="Чтобы увидеть остатки отходов, выберите организацию в верхней панели."
    >
      <div className="space-y-8">
        <DashboardSummarySection
          preset={summaryPreset}
          dateFrom={search.summary_from}
          dateTo={search.summary_to}
          summary={summaryQuery.summary}
          loading={summaryQuery.loading}
          error={summaryQuery.error}
          rangeError={summaryRange.error}
          onPresetChange={selectSummaryPreset}
          onRangeChange={(range) =>
            patchSearch({
              summary_preset: "custom",
              summary_from: range.date_from,
              summary_to: range.date_to,
            })
          }
        />

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
              values={{ year: burialYear }}
              onChange={(patch) => {
                if (patch.year !== undefined) {
                  patchSearch({ burial_year: patch.year });
                }
              }}
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
          className="xl:grid-cols-[1fr]"
          error={formedQuery.error}
          errorTitle="Не удалось загрузить образование отходов"
          title="Образование отходов"
          description="Сумма образования за год. Нажмите строку, чтобы открыть распределение по подразделениям и динамику по месяцам."
          actions={
            <DashboardFormedFilters
              values={{ year: formedYear }}
              onChange={(patch) => {
                if (patch.year !== undefined) {
                  patchSearch({ formed_year: patch.year });
                }
              }}
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
