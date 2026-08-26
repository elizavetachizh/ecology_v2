import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import {
  useUnitAncestorChain,
  type Unit,
} from "../../../../../../entities/waste/units";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../../../../shared/ui";

type UnitHierarchyBreadcrumbProps = {
  tenantId: string | null;
  /** Последняя существующая единица: карточка (edit) или родитель (create). */
  unit?: Unit | null;
  /** Подпись текущей страницы, если единицы ещё нет (create). */
  currentLabel?: string;
};

function crumbClassName(isLast: boolean) {
  return isLast
    ? "max-w-56 truncate sm:max-w-xs"
    : "max-w-40 truncate sm:max-w-56";
}

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

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/directories/units">Структура</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {loading && items.length <= 1 && unit?.parent_id ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-muted-foreground">…</span>
            </BreadcrumbItem>
          </>
        ) : null}

        {items.map((item, index) => {
          const isLastExisting = index === items.length - 1;
          const isPage = !creating && isLastExisting;
          return (
            <Fragment key={item.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isPage ? (
                  <BreadcrumbPage className={crumbClassName(true)}>
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to="/directories/units/$unitId"
                      params={{ unitId: item.id }}
                      search={{ instructionId: undefined }}
                      className={crumbClassName(isLastExisting && !creating)}
                    >
                      {item.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}

        {currentLabel ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className={crumbClassName(true)}>
                {currentLabel}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
