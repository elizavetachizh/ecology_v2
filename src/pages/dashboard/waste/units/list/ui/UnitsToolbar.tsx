import { ListSearchField, Switch } from "../../../../../../shared/ui";

type UnitsToolbarProps = {
  query: string;
  pod9Only: boolean;
  onSearch: (q: string | undefined) => void;
  onPod9OnlyChange: (checked: boolean) => void;
};

export function UnitsToolbar({
  query,
  pod9Only,
  onSearch,
  onPod9OnlyChange,
}: UnitsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ListSearchField
        value={query}
        placeholder="Поиск по названию или краткому"
        onSearch={(q) => onSearch(q || undefined)}
      />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <Switch
          checked={pod9Only}
          onCheckedChange={onPod9OnlyChange}
          aria-label="Только журналы ПОД-9"
        />
        Только журналы ПОД-9
      </label>
    </div>
  );
}
