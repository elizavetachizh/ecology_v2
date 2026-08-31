import { useWatch } from "react-hook-form";
import {
  NEUTRALIZATION_METHOD_LABEL,
  NeutralizationMethodValues,
  USE_PURPOSE_LABEL,
  UsePurposeValues,
} from "../../../../../entities/waste/operations";
import type { WasteSourceBrief } from "../../../../../entities/waste/waste-sources";
import {
  isInternalTransferType,
  type OperationFormValues,
} from "../../model/operation-form.schema";
import { EnumSelectField } from "./EnumSelectField";
import { FormedFields } from "./FormedFields";
import { InternalTransferFields } from "./InternalTransferFields";
import { ReceivedOutFields } from "./ReceivedOutFields";
import { TransferredOutFields } from "./TransferredOutFields";

type OperationTypeFieldsProps = {
  pending: boolean;
  tenantId: string | null;
  bindingSources: WasteSourceBrief[];
};

export function OperationTypeFields({
  pending,
  tenantId,
  bindingSources,
}: OperationTypeFieldsProps) {
  const operationType = useWatch<OperationFormValues, "operation_type">({
    name: "operation_type",
  });

  if (operationType === "formed") {
    return (
      <FormedFields
        pending={pending}
        bindingSources={bindingSources}
        tenantId={tenantId}
      />
    );
  }

  if (operationType === "used") {
    return (
      <EnumSelectField
        name="use_purpose"
        label="Цель использования"
        values={UsePurposeValues}
        labels={USE_PURPOSE_LABEL}
        placeholder="Выберите цель"
        pending={pending}
      />
    );
  }

  if (operationType === "neutralized") {
    return (
      <EnumSelectField
        name="neutralization_method"
        label="Способ обезвреживания"
        values={NeutralizationMethodValues}
        labels={NEUTRALIZATION_METHOD_LABEL}
        placeholder="Выберите способ"
        pending={pending}
      />
    );
  }

  if (isInternalTransferType(operationType)) {
    return <InternalTransferFields pending={pending} />;
  }

  if (operationType === "received_out") {
    return <ReceivedOutFields pending={pending} tenantId={tenantId} />;
  }

  if (operationType === "transferred_out") {
    return <TransferredOutFields pending={pending} />;
  }

  return null;
}
