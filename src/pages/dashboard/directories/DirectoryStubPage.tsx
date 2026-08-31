import { DirectoryBreadcrumb, PageContextBar } from "../../../shared/ui";

type DirectoryStubPageProps = {
  title: string;
  description?: string;
  directoryTo: string;
};

export function DirectoryStubPage({
  title,
  description = "Раздел в разработке. Пока доступен просмотр карточек справочников и иерархии структуры.",
  directoryTo,
}: DirectoryStubPageProps) {
  return (
    <PageContextBar
      sticky={false}
      eyebrow={
        <DirectoryBreadcrumb directoryLabel={title} directoryTo={directoryTo} />
      }
      title={title}
      description={description}
    />
  );
}
