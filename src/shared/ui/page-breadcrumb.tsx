import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

export type PageBreadcrumbItem = {
  label: string;
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
};

type PageBreadcrumbProps = {
  items: PageBreadcrumbItem[];
};

function crumbClassName(isLast: boolean) {
  return isLast
    ? "max-w-56 truncate sm:max-w-xs"
    : "max-w-40 truncate sm:max-w-56";
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className={crumbClassName(true)}>
                    {item.label}
                  </BreadcrumbPage>
                ) : item.to ? (
                  <BreadcrumbLink asChild>
                    <Link
                      to={item.to}
                      params={item.params}
                      search={item.search}
                      className={crumbClassName(false)}
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <span className="text-muted-foreground">{item.label}</span>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
