import {
  useUnitAncestorChain,
  type Unit,
} from "../../../../../../entities/waste/units";
import {
  DirectoryBreadcrumb,
  type PageBreadcrumbItem,
} from "../../../../../../shared/ui";
import { routes } from "../../../../../../shared/config/routes";

type UnitHierarchyBreadcrumbProps = {
  tenantId: string | null;
  /** Последняя существующая единица: карточка (edit) или родитель (create). */
  unit?: Unit | null;
  /** Подпись текущей страницы, если единицы ещё нет (create). */
  currentLabel?: string;
};

export function UnitHierarchyBreadcrumb({
  tenantId,
  unit,
  currentLabel,
}: UnitHierarchyBreadcrumbProps) {
  const { items, loading } = useUnitAncestorChain({
    tenantId,
    unit,
    enabled: Boolean(unit),
  });

  const creating = Boolean(currentLabel);
  const extra: PageBreadcrumbItem[] = [];

  if (loading && items.length <= 1 && unit?.parent_id) {
    extra.push({ label: "…" });
  }

  items.forEach((item, index) => {
    const isLastExisting = index === items.length - 1;
    const isPage = !creating && isLastExisting;
    extra.push(
      isPage
        ? { label: item.name }
        : {
            label: item.name,
            to: routes.directories.units.detail,
            params: { unitId: item.id },
            search: { instructionId: undefined },
          },
    );
  });

  return (
    <DirectoryBreadcrumb
      directoryLabel="Структура организации"
      directoryTo={routes.directories.units.list}
      extra={extra}
      current={currentLabel}
    />
  );
}
