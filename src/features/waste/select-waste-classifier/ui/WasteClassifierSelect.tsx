import type { WasteClassifier } from "../../../../entities/waste/waste-classifier";
import { AsyncCombobox } from "../../../../shared/ui";
import { useWasteClassifierOptions } from "../model/use-waste-classifier-options";

type WasteClassifierSelectProps = {
  value: string;
  selectedLabel?: string;
  onChange: (item: WasteClassifier | null) => void;
};

export function WasteClassifierSelect({
  value,
  selectedLabel,
  onChange,
}: WasteClassifierSelectProps) {
  const { options, loading, search, setSearch } = useWasteClassifierOptions();

  return (
    <AsyncCombobox
      options={options.map((option) => ({
        value: String(option.id),
        label: `${option.code} — ${option.name}`,
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
      placeholder="Выберите отход из классификатора"
      searchPlaceholder="Поиск отхода"
      emptyMessage={
        loading ? "Загрузка…" : "Начните вводить код или название отхода"
      }
      className="w-full"
      contentClassName="w-full"
      search={search}
      setSearch={setSearch}
    />
  );
}
