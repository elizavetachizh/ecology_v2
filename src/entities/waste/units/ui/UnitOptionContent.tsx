import { Badge } from "../../../../shared/ui";

type UnitOptionContentProps = {
  option: { value: string; label: string };
  isPod9: boolean;
};

export function UnitOptionContent({ option, isPod9 }: UnitOptionContentProps) {
  return (
    <>
      <span className="min-w-0 flex-1 truncate">{option.label}</span>
      {isPod9 ? (
        <Badge variant="info" className="shrink-0">
          ПОД-9
        </Badge>
      ) : null}
    </>
  );
}
