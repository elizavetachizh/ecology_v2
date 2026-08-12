import { Link } from "@tanstack/react-router";
import { Button } from "../../../shared/ui";
import {
  DIRECTORY_CARDS,
} from "../../../shared/config/directories";

export function DirectoriesHubPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Справочники
        </h1>
        <p className="text-sm text-muted-foreground">
          Начните с инструкции, затем заполните структуру и остальные
          справочники.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {DIRECTORY_CARDS.map((card) => (
          <article
            key={card.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-foreground">{card.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{card.description}</p>
            </div>
            <div className="mt-auto flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                Записей: {card.count}
              </span>
              <Button asChild size="sm">
                <Link to={card.to}>Открыть</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
