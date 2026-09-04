import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useTenant } from "../../entities/tenant";
import {
  currentCalendarYear,
  DEFAULT_DASHBOARD_MONTHS,
  firstBurialPermitSelection,
  firstDashboardSelection,
  summarizeDashboardBalance,
  todayIsoDate,
  useDashboardBalanceQuery,
  useDashboardBalanceStatQuery,
  useDashboardBurialPermitStatQuery,
  useDashboardBurialPermitsQuery,
  yearFromIsoDate,
} from "../../entities/waste/dashboards";
import {
  DashboardBalanceChart,
  DashboardBalanceTable,
  DashboardBurialFilters,
  DashboardBurialPermitChart,
  DashboardBurialPermitTable,
  DashboardFilters,
  DashboardSummary,
} from "../../features/waste/view-dashboard";
import { routes } from "../../shared/config/routes";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  PageContextBar,
  TenantRequiredGate,
} from "../../shared/ui";

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

  const summary = summarizeDashboardBalance(groups);

  const patchSearch = (patch: {
    on_date?: string;
    unit_id?: string;
    waste_id?: string;
    months?: number;
    year?: number;
    permit_id?: string;
    permit_waste_id?: string;
  }) => {
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
        {error ? (
          <Alert variant="error">
            <AlertTitle>Не удалось загрузить остатки</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <PageContextBar
              sticky={false}
              title="Остатки отходов"
              description="Снимок на выбранную дату. Нажмите строку, чтобы открыть динамику."
              actions={
                <DashboardFilters
                  values={{ on_date: onDate }}
                  onChange={(patch) => patchSearch(patch)}
                />
              }
            />

            {!loading ? <DashboardSummary summary={summary} /> : null}

            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
              <DashboardBalanceTable
                groups={groups}
                loading={loading}
                selectedUnitId={unitId}
                selectedWasteId={wasteId}
                onSelect={(selection) => patchSearch(selection)}
              />
              <div className="xl:sticky xl:top-4">
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
              </div>
            </div>
          </div>
        )}

        {burialQuery.error ? (
          <Alert variant="error">
            <AlertTitle>Не удалось загрузить разрешения</AlertTitle>
            <AlertDescription>{burialQuery.error.message}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <PageContextBar
              sticky={false}
              title="Захоронение"
              description="Факт вывоза на захоронение за год по разрешениям. Нажмите строку, чтобы открыть график по месяцам."
              actions={
                <DashboardBurialFilters
                  values={{ year }}
                  onChange={(patch) => patchSearch(patch)}
                />
              }
            />
            <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
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
              <div className="xl:sticky xl:top-4">
                <DashboardBurialPermitChart
                  stat={burialStatQuery.stat}
                  loading={burialStatQuery.loading}
                  error={burialStatQuery.error}
                  selected={burialSelected}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </TenantRequiredGate>
  );
}
