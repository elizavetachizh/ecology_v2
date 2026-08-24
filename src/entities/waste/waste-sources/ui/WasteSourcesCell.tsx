import { Badge } from "../../../../shared/ui";

type WasteSourceLike = {
  id: string;
  name: string;
};

type WasteSourcesCellProps = {
  sources: WasteSourceLike[];
};

export function WasteSourcesCell({ sources }: WasteSourcesCellProps) {
  if (sources.length === 0) {
    return <span className="text-xs text-muted-foreground">Не указаны</span>;
  }

  return (
    <div className="flex max-w-xs flex-wrap gap-1">
      {sources.map((source) => (
        <Badge key={source.id} variant="secondary">
          {source.name}
        </Badge>
      ))}
    </div>
  );
}
