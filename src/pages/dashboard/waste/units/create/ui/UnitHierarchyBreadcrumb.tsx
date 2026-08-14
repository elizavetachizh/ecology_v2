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
  unit: Unit;
};

export function UnitHierarchyBreadcrumb({
  tenantId,
  unit,
}: UnitHierarchyBreadcrumbProps) {
  const { items, loading } = useUnitAncestorChain({ tenantId, unit });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/directories/units">Структура</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {loading && items.length <= 1 && unit.parent_id ? (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-muted-foreground">…</span>
            </BreadcrumbItem>
          </>
        ) : null}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.id}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="max-w-56 truncate sm:max-w-xs">
                    {item.name}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to="/directories/units/$unitId"
                      params={{ unitId: item.id }}
                      search={{ instructionId: undefined }}
                      className="max-w-40 truncate sm:max-w-56"
                    >
                      {item.name}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
