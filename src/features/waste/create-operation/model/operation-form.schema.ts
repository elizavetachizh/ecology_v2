import { z } from "zod";
import {
  NeutralizationMethodValues,
  OperationTypeValues,
  TransferReceiptPurposeValues,
  UsePurposeValues,
  type OperationType,
} from "../../../../entities/waste/operations";

const amountSchema = z
  .string()
  .trim()
  .min(1, "Укажите количество")
  .regex(/^\d+(\.\d{1,6})?$/, "Число больше 0, не более 6 знаков после запятой")
  .refine((value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 && n <= 999_999.999_999;
  }, "Количество должно быть больше 0");

const uuidValue = z.string().uuid();

function requireUuid(
  ctx: z.RefinementCtx,
  path: string,
  value: string,
  message: string,
) {
  if (!uuidValue.safeParse(value).success) {
    ctx.addIssue({ code: "custom", path: [path], message });
  }
}

function requireEnum(
  ctx: z.RefinementCtx,
  path: string,
  value: string,
  allowed: readonly string[],
  message: string,
) {
  if (!allowed.includes(value)) {
    ctx.addIssue({ code: "custom", path: [path], message });
  }
}

export const OperationDocumentKindValues = ["passport", "ttn"] as const;
export type OperationDocumentKind =
  (typeof OperationDocumentKindValues)[number];

export function isInternalTransferType(type: OperationType) {
  return type === "received_in" || type === "transferred_in";
}

export function needsTransferReceiptPurpose(type: OperationType) {
  return (
    isInternalTransferType(type) ||
    type === "received_out" ||
    type === "transferred_out"
  );
}

export const operationFormSchema = z
  .object({
    date: z
      .string()
      .min(1, "Укажите дату операции")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате ГГГГ-ММ-ДД"),
    operation_type: z.enum(OperationTypeValues, {
      error: "Выберите тип операции",
    }),
    unit_id: z.string().uuid("Выберите место учёта"),
    waste_id: z.string().uuid("Выберите отход"),
    amount: amountSchema,
    waste_source_id: z.string(),
    use_purpose: z.string(),
    neutralization_method: z.string(),
    unit_side_id: z.string(),
    transfer_receipt_purpose: z.string(),
    counterparty_id: z.string(),
    document_kind: z.union([
      z.literal(""),
      z.enum(OperationDocumentKindValues),
    ]),
    passport_id: z.string(),
    ttn_id: z.string(),
  })
  .superRefine((values, ctx) => {
    const type = values.operation_type;

    if (type === "formed") {
      requireUuid(
        ctx,
        "waste_source_id",
        values.waste_source_id,
        "Выберите источник образования",
      );
    }

    if (type === "used") {
      requireEnum(
        ctx,
        "use_purpose",
        values.use_purpose,
        UsePurposeValues,
        "Выберите цель использования",
      );
    }

    if (type === "neutralized") {
      requireEnum(
        ctx,
        "neutralization_method",
        values.neutralization_method,
        NeutralizationMethodValues,
        "Выберите способ обезвреживания",
      );
    }

    if (isInternalTransferType(type)) {
      requireUuid(
        ctx,
        "unit_side_id",
        values.unit_side_id,
        "Выберите структурное подразделение",
      );
      if (
        uuidValue.safeParse(values.unit_side_id).success &&
        values.unit_side_id === values.unit_id
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["unit_side_id"],
          message: "Подразделение не может совпадать с местом учёта",
        });
      }
    }

    if (needsTransferReceiptPurpose(type)) {
      requireEnum(
        ctx,
        "transfer_receipt_purpose",
        values.transfer_receipt_purpose,
        TransferReceiptPurposeValues,
        "Выберите цель передачи или поступления",
      );
    }

    if (type === "received_out") {
      requireUuid(
        ctx,
        "counterparty_id",
        values.counterparty_id,
        "Выберите контрагента",
      );
    }

    if (type === "transferred_out") {
      if (values.document_kind === "passport") {
        requireUuid(
          ctx,
          "passport_id",
          values.passport_id,
          "Выберите сопроводительный паспорт",
        );
      } else if (values.document_kind === "ttn") {
        requireUuid(ctx, "ttn_id", values.ttn_id, "Выберите ТТН");
      } else {
        ctx.addIssue({
          code: "custom",
          path: ["document_kind"],
          message: "Выберите паспорт или ТТН",
        });
      }
    }
  });

export type OperationFormValues = z.infer<typeof operationFormSchema>;

export const EMPTY_TYPE_SPECIFIC_VALUES = {
  waste_source_id: "",
  use_purpose: "",
  neutralization_method: "",
  unit_side_id: "",
  transfer_receipt_purpose: "",
  counterparty_id: "",
  document_kind: "" as OperationFormValues["document_kind"],
  passport_id: "",
  ttn_id: "",
};

export function todayIsoDate(): string {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function createEmptyOperationFormValues(): OperationFormValues {
  return {
    date: todayIsoDate(),
    operation_type: "" as OperationFormValues["operation_type"],
    unit_id: "",
    waste_id: "",
    amount: "",
    ...EMPTY_TYPE_SPECIFIC_VALUES,
  };
}
