import { routes } from "../config/routes";
import type { PageBreadcrumbItem } from "./page-breadcrumb";

export type DirectoryBreadcrumbProps = {
  directoryLabel: string;
  directoryTo: string;
  extra?: PageBreadcrumbItem[];
  current?: string;
};

export function directoryBreadcrumbItems({
  directoryLabel,
  directoryTo,
  extra = [],
  current,
}: DirectoryBreadcrumbProps): PageBreadcrumbItem[] {
  const deeper = extra.length > 0 || Boolean(current);
  return [
    { label: "Справочники", to: routes.directories.index },
    { label: directoryLabel, to: deeper ? directoryTo : undefined },
    ...extra,
    ...(current ? [{ label: current }] : []),
  ];
}
