import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button, PageContextBar } from "../../../../../../shared/ui";

type UnitsPageHeaderProps = {
  onCreateRoot: () => void;
};

export function UnitsPageHeader({ onCreateRoot }: UnitsPageHeaderProps) {
  return (
    <PageContextBar
      sticky={false}
      title="Структура организации"
      description="Иерархия структурных единиц: подразделения, цеха, площадки, журналы ПОД-9."
      actions={
        <>
          <Button type="button" size="sm" onClick={onCreateRoot}>
            <Plus className="size-3.5" />
            Добавить структурную единицу
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/directories">К справочникам</Link>
          </Button>
        </>
      }
    />
  );
}
