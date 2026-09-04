import {
  DASHBOARD_YEAR_MAX,
  DASHBOARD_YEAR_MIN,
} from "../../../../entities/waste/dashboards";
import { Input } from "../../../../shared/ui";

export type DashboardBurialFiltersValue = {
  year: number;
};

type DashboardBurialFiltersProps = {
  values: DashboardBurialFiltersValue;
  onChange: (patch: Partial<DashboardBurialFiltersValue>) => void;
};

export function DashboardBurialFilters({
  values,
  onChange,
}: DashboardBurialFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">год</span>
        <Input
          type="number"
          min={DASHBOARD_YEAR_MIN}
          max={DASHBOARD_YEAR_MAX}
          aria-label="Год разрешений"
          className="w-24"
          value={values.year}
          onChange={(event) => {
            const year = Number(event.target.value);
            if (
              Number.isInteger(year) &&
              year >= DASHBOARD_YEAR_MIN &&
              year <= DASHBOARD_YEAR_MAX
            ) {
              onChange({ year });
            }
          }}
        />
      </div>
    </div>
  );
}
