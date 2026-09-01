import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type {
  ContractStatus,
  ContractType,
} from "../../../../entities/waste/contracts";
import { Button } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

type ContractNextStepCtaProps = {
  contractId: string;
  contractType: ContractType;
  status: ContractStatus;
  wasteCount: number;
};

export function ContractNextStepCta({
  contractId,
  contractType,
  status, 
  wasteCount,
}: ContractNextStepCtaProps) {
  if (contractType !== "recycling" || status !== "active") return null;

  const canCreatePassport = wasteCount > 0;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">Следующий шаг</h2>
        <p className="text-sm text-muted-foreground">
          Договор утилизации готов. Создайте сопроводительный паспорт и/или ТТН
          — это отдельные документы.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canCreatePassport ? (
          <Button asChild size="sm">
            <Link
              to={routes.waste.passports.new}
              search={{ recycling_contract_id: contractId }}
            >
              Создать сопроводительный паспорт
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Чтобы создать паспорт, добавьте хотя бы один отход в перечень и
            сохраните договор.
          </p>
        )}
        <Button
          asChild
          size="sm"
          variant={canCreatePassport ? "outline" : "default"}
        >
          <Link
            to={routes.waste.ttns.new}
            search={{ recycling_contract_id: contractId }}
          >
            Создать ТТН
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
