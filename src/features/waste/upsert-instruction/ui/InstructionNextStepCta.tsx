import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

/** Следующий шаг онбординга после действующей инструкции. */
export function InstructionNextStepCta() {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Следующий шаг</h2>
        <p className="text-sm text-muted-foreground">
          Заполните структуру организации: подразделения и места учёта отходов.
        </p>
      </div>
      <Button asChild size="sm">
        <Link to={routes.directories.units.list}>
          Перейти к структуре
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </section>
  );
}
