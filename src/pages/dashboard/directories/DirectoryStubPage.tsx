import { Link } from "@tanstack/react-router";
import { Button } from "../../../shared/ui";

type DirectoryStubPageProps = {
  title: string;
  description?: string;
};

export function DirectoryStubPage({
  title,
  description = "Раздел в разработке. Пока доступен просмотр карточек справочников и иерархии структуры.",
}: DirectoryStubPageProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="outline" size="sm">
        <Link to="/directories">К справочникам</Link>
      </Button>
    </div>
  );
}
