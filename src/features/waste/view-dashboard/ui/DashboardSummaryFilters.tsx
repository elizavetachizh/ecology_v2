import {
  SUMMARY_PRESET_LABEL,
  SUMMARY_PRESET_VALUES,
  type SummaryPreset,
} from "../../../../entities/waste/dashboards";
import { Button, DateFilterInput } from "../../../../shared/ui";

export type DashboardSummaryFiltersValue = {
  preset: SummaryPreset;
  dateFrom?: string;
  dateTo?: string;
};

type DashboardSummaryFiltersProps = {
  values: DashboardSummaryFiltersValue;
  onPresetChange: (preset: SummaryPreset) => void;
  onRangeChange: (range: { date_from?: string; date_to?: string }) => void;
};

export function DashboardSummaryFilters({
  values,
  onPresetChange,
  onRangeChange,
}: DashboardSummaryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="radiogroup" aria-label="Период сводки" className="flex flex-wrap gap-1">
        {SUMMARY_PRESET_VALUES.map((preset) => {
          const selected = values.preset === preset;
          return (
            <Button
              key={preset}
              type="button"
              role="radio"
              size="sm"
              variant={selected ? "default" : "outline"}
              aria-checked={selected}
              onClick={() => onPresetChange(preset)}
            >
              {SUMMARY_PRESET_LABEL[preset]}
            </Button>
          );
        })}
      </div>
      {values.preset === "custom" ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm text-muted-foreground">с</span>
          <DateFilterInput
            aria-label="Начало периода"
            value={values.dateFrom}
            onValueChange={(date_from) =>
              onRangeChange({
                date_from,
                date_to: values.dateTo,
              })
            }
          />
          <span className="text-sm text-muted-foreground">по</span>
          <DateFilterInput
            aria-label="Конец периода"
            value={values.dateTo}
            onValueChange={(date_to) =>
              onRangeChange({
                date_from: values.dateFrom,
                date_to,
              })
            }
          />
        </div>
      ) : null}
    </div>
  );
}
