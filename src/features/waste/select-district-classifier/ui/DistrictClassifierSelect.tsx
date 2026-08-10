import type { DistrictClassifier } from "../../../../entities/waste/district-classifier";
import { AsyncCombobox } from "../../../../shared/ui";
import { useDistrictClassifierOptions } from "../model/use-district-classifier-options";

type DistrictClassifierSelectProps = {
  region_id: number;
  value: string;
  selectedLabel?: string;
  onChange: (item: DistrictClassifier | null) => void;
};

export function DistrictClassifierSelect({
  region_id,
  value,
  selectedLabel,
  onChange,
}: DistrictClassifierSelectProps) {
  const { options, loading, search, setSearch } = useDistrictClassifierOptions({
    region_id,
  });

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
      placeholder="Выберите район из классификатора"
      searchPlaceholder="Поиск района"
      emptyMessage={loading ? "Загрузка…" : "Начните вводить название района"}
      className="w-full"
      contentClassName="w-full"
      search={search}
      setSearch={setSearch}
    />
  );
}
