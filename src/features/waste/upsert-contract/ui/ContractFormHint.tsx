import { Link } from "@tanstack/react-router";
import type { ContractType } from "../../../../entities/waste/contracts";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from "../../../../shared/ui";

type ContractFormHintProps = {
  contractType: ContractType;
};

export function ContractFormHint({ contractType }: ContractFormHintProps) {
  if (contractType === "transport") {
    return (
      <Alert variant="info">
        <AlertTitle>Договор перевозки</AlertTitle>
        <AlertDescription>
          Нужен только если в сопроводительном паспорте выбран способ «по
          договору перевозки». Перечень отходов и сумма допустимы и на этом
          типе.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="info">
      <AlertTitle>Договор утилизации</AlertTitle>
      <AlertDescription>
        Для сопроводительного паспорта нужен договор этого типа хотя бы с одним
        отходом в перечне. Сначала заведите{" "}
        <Button asChild variant="link" className="h-auto p-0 text-sm">
          <Link to="/directories/counterparties">контрагента</Link>
        </Button>
        , если его ещё нет.
      </AlertDescription>
    </Alert>
  );
}
