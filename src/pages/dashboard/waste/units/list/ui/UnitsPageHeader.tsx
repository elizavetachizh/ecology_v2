import { Plus } from "lucide-react";
import {
  Button,
  DirectoryBreadcrumb,
  PageContextBar,
} from "../../../../../../shared/ui";
import { routes } from "../../../../../../shared/config/routes";

type UnitsPageHeaderProps = {
  onCreateRoot: () => void;
};

export function UnitsPageHeader({ onCreateRoot }: UnitsPageHeaderProps) {
  return (
    <PageContextBar
      sticky={false}
      eyebrow={
        <DirectoryBreadcrumb
          directoryLabel="Структура организации"
          directoryTo={routes.directories.units.list}
        />
      }
      title="Структура организации"
      description="Иерархия структурных единиц: подразделения, цеха, площадки, журналы ПОД-9."
      actions={
        <Button type="button" size="sm" onClick={onCreateRoot}>
          <Plus className="size-3.5" />
          Добавить структурную единицу
        </Button>
      }
    />
  );
}
