import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

/** Следующий шаг онбординга после создания контрагента. */
export function CounterpartyNextStepCta({
  counterpartyId,
}: {
  counterpartyId?: string;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Следующий шаг</h2>
        <p className="text-sm text-muted-foreground">
          Создайте договоры с контрагентом типа утилизация/перевозка.
        </p>
      </div>
      <Button asChild size="sm">
        <Link
          search={{ counterparty_id: counterpartyId }}
          to={routes.directories.contracts.new}
        >
          Создать договор
          <ArrowRight className="size-3.5" />
        </Link>
      </Button>
    </section>
  );
}
