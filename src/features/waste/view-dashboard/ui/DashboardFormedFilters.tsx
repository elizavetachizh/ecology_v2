import {
  DASHBOARD_YEAR_MAX,
  DASHBOARD_YEAR_MIN,
} from "../../../../entities/waste/dashboards";
import { Input } from "../../../../shared/ui";

export type DashboardFormedFiltersValue = {
  year: number;
};

type DashboardFormedFiltersProps = {
  values: DashboardFormedFiltersValue;
  onChange: (patch: Partial<DashboardFormedFiltersValue>) => void;
};

export function DashboardFormedFilters({
  values,
  onChange,
}: DashboardFormedFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">год</span>
        <Input
          type="number"
          min={DASHBOARD_YEAR_MIN}
          max={DASHBOARD_YEAR_MAX}
          aria-label="Год образования"
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
