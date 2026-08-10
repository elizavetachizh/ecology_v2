import type { RegionClassifier } from "../../../../entities/waste/region-classifier";
import { AsyncCombobox } from "../../../../shared/ui";
import { useRegionClassifierOptions } from "../model/use-region-classifier-options";

type RegionClassifierSelectProps = {
  value: string;
  selectedLabel?: string;
  onChange: (item: RegionClassifier | null) => void;
};

export function RegionClassifierSelect({
  value,
  selectedLabel,
  onChange,
}: RegionClassifierSelectProps) {
  const { options, loading, search, setSearch } = useRegionClassifierOptions();

  return (
    <AsyncCombobox
      options={options.map((option) => ({
        value: String(option.id),
        label: `${option.name}`,
      }))}
      value={value}
      selectedLabel={selectedLabel}
      onValueChange={(id) => {
        if (!id) {
          onChange(null);
          return;
        }
        const item = options.find((option) => String(option.id) === id) ?? null;
        onChange(item);
      }}
      placeholder="Выберите регион из классификатора"
      searchPlaceholder="Поиск региона"
      emptyMessage={loading ? "Загрузка…" : "Начните вводить название региона"}
      className="w-full"
      contentClassName="w-full"
      search={search}
      setSearch={setSearch}
    />
  );
}
