import { useMemo } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useTenant } from "../../entities/tenant";
import {
  DEFAULT_DASHBOARD_MONTHS,
  firstDashboardSelection,
  summarizeDashboardBalance,
  todayIsoDate,
  useDashboardBalanceQuery,
  useDashboardBalanceStatQuery,
} from "../../entities/waste/dashboards";
import {
  DashboardBalanceChart,
  DashboardBalanceTable,
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

  const summary = summarizeDashboardBalance(groups);

  const patchSearch = (patch: {
    on_date?: string;
    unit_id?: string;
    waste_id?: string;
    months?: number;
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
    </TenantRequiredGate>
  );
}
