import { DateFilterInput } from "../../../../shared/ui";

export type DashboardFiltersValue = {
  on_date: string;
};

type DashboardFiltersProps = {
  values: DashboardFiltersValue;
  onChange: (patch: Partial<DashboardFiltersValue>) => void;
};

export function DashboardFilters({ values, onChange }: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">на дату</span>
        <DateFilterInput
          aria-label="Дата остатков"
          value={values.on_date}
          onValueChange={(on_date) => {
            if (on_date) onChange({ on_date });
          }}
        />
      </div>
    </div>
  );
}
