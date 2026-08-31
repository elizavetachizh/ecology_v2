import { PageBreadcrumb } from "./page-breadcrumb";
import {
  directoryBreadcrumbItems,
  type DirectoryBreadcrumbProps,
} from "./directory-breadcrumb-items";

/** Хаб → список справочника → опционально иерархия / текущая страница. */
export function DirectoryBreadcrumb(props: DirectoryBreadcrumbProps) {
  return <PageBreadcrumb items={directoryBreadcrumbItems(props)} />;
}
