import { useQuery } from "@tanstack/react-query";
import { AsyncCombobox } from "../../../../shared/ui";
import { HAZARD_CLASS_LABEL, type WasteBrief } from "../model/wastes.types";
import { wasteLabel } from "../model/waste-label";
import { useWastesOptions } from "../model/use-wastes-query";
import { wastesQueryKeys } from "../model/waste-query-keys";
import { getWaste } from "../api/get-waste";

type WasteSelectProps = {
  tenantId: string | null;
  value: string;
  disabled?: boolean;
  enabled?: boolean;
  placeholder?: string;
  "aria-label"?: string;
  onChange: (id: string) => void;
};

function wasteSelectLabel(
  item: Pick<WasteBrief, "waste_classifier" | "hazard_class">,
) {
  return `${wasteLabel(item)} (${HAZARD_CLASS_LABEL[item.hazard_class]})`;
}

export function WasteSelect({
  tenantId,
  value,
  disabled,
  enabled = true,
  placeholder = "Выберите отход из справочника",
  "aria-label": ariaLabel = "Отход",
  onChange,
}: WasteSelectProps) {
  const canFetch = Boolean(tenantId) && enabled;
  const { options, loading, search, setSearch, refetch, refreshing } =
    useWastesOptions({
      tenantId,
      enabled: canFetch,
    });

  const selectedQuery = useQuery({
    queryKey: wastesQueryKeys.detail(tenantId ?? "none", value || "none"),
    queryFn: ({ signal }) => getWaste(value, signal),
    enabled: Boolean(tenantId && value),
  });

  const selected =
    options.find((item) => item.id === value) ??
    (selectedQuery.data?.id === value ? selectedQuery.data : null);

  return (
    <AsyncCombobox
      options={options.map((item) => ({
        value: item.id,
        label: wasteSelectLabel(item),
      }))}
      value={value}
      selectedLabel={selected ? wasteSelectLabel(selected) : undefined}
      onValueChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Поиск по коду или наименованию"
      emptyMessage={loading ? "Загрузка…" : "Ничего не найдено"}
      search={search}
      setSearch={setSearch}
      disabled={disabled}
      className="w-full"
      contentClassName="w-full"
      aria-label={ariaLabel}
      onRefresh={() => {
        void refetch();
      }}
      refreshing={refreshing}
    />
  );
}
