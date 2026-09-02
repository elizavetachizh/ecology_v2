import { useMemo, useState } from "react";
import {
  DEFAULT_PASSPORTS_LIST_LIMIT,
  usePassportsListQuery,
} from "../../../../entities/waste/passports";
import {
  DEFAULT_TTNS_LIST_LIMIT,
  useTtnsListQuery,
} from "../../../../entities/waste/ttns";
import { AsyncCombobox } from "../../../../shared/ui";
import type { OperationDocumentKind } from "../model/operation-form.schema";
import { formatDate } from "../../../../shared/lib/format-date";
import {
  TRANSFER_PURPOSE_LABEL,
  type TransferPurpose,
} from "../../../../entities/waste/contracts";

type DocumentItem = {
  id: string;
  number: string;
  date: string;
  recycling_contract?: { transfer_purpose: TransferPurpose | null };
};

function documentLabel(
  item: Pick<DocumentItem, "number" | "date" | "recycling_contract">,
) {
  return `${item.number} от ${formatDate(item.date)} · ${item.recycling_contract?.transfer_purpose ? TRANSFER_PURPOSE_LABEL[item.recycling_contract.transfer_purpose] : ""}`;
}

const COPY = {
  passport: {
    placeholder: "Выберите сопроводительный паспорт",
    empty: "Нет действующих паспортов с этим отходом",
    "aria-label": "Сопроводительный паспорт",
  },
  ttn: {
    placeholder: "Выберите ТТН",
    empty: "Нет действующих ТТН на этом месте учёта",
    "aria-label": "ТТН",
  },
} as const;

type DocumentComboboxViewProps = {
  kind: OperationDocumentKind;
  items: DocumentItem[];
  loading: boolean;
  value: string;
  fallbackDocument?: { number: string; date: string } | null;
  disabled?: boolean;
  onChange: (id: string) => void;
  refetch?: () => void;
  refreshing?: boolean;
};

function DocumentComboboxView({
  kind,
  items,
  loading,
  refetch,
  refreshing,
  value,
  fallbackDocument,
  disabled,
  onChange,
}: DocumentComboboxViewProps) {
  const [search, setSearch] = useState("");
  const copy = COPY[kind];
  const needle = search.trim().toLowerCase();
  const options = needle
    ? items.filter((item) => documentLabel(item).toLowerCase().includes(needle))
    : items;
  const selected = items.find((item) => item.id === value);

  return (
    <AsyncCombobox
      options={options.map((item) => ({
        value: item.id,
        label: documentLabel(item),
      }))}
      value={value}
      selectedLabel={
        selected
          ? documentLabel(selected)
          : fallbackDocument
            ? documentLabel(fallbackDocument)
            : undefined
      }
      onValueChange={onChange}
      placeholder={copy.placeholder}
      searchPlaceholder="Поиск по номеру"
      emptyMessage={
        loading ? "Загрузка…" : needle ? "Ничего не найдено" : copy.empty
      }
      search={search}
      setSearch={setSearch}
      disabled={disabled || loading}
      className="w-full"
      contentClassName="w-full"
      aria-label={copy["aria-label"]}
      onRefresh={refetch ? () => void refetch() : undefined}
      refreshing={refreshing}
    />
  );
}

type SharedProps = {
  tenantId: string | null;
  unitId: string;
  value: string;
  fallbackDocument?: { number: string; date: string } | null;
  disabled?: boolean;
  onChange: (id: string) => void;
};

function PassportDocumentCombobox({
  tenantId,
  unitId,
  wasteId,
  value,
  fallbackDocument,
  disabled,
  onChange,
}: SharedProps & { wasteId: string }) {
  const query = usePassportsListQuery({
    tenantId,
    enabled: Boolean(tenantId && unitId && wasteId),
    params: {
      unit_id: unitId,
      status: "active",
      limit: DEFAULT_PASSPORTS_LIST_LIMIT,
      offset: 0,
      sort: "number",
      order: "asc",
    },
  });

  const items = useMemo(
    () =>
      query.items.filter((item) =>
        item.wastes.some((waste) => waste.waste_id === wasteId),
      ),
    [query.items, wasteId],
  );

  return (
    <DocumentComboboxView
      kind="passport"
      items={items}
      loading={query.loading}
      refreshing={query.refreshing}
      refetch={() => {
        void query.refetch();
      }}
      value={value}
      fallbackDocument={fallbackDocument}
      disabled={disabled}
      onChange={onChange}
    />
  );
}

function TtnDocumentCombobox({
  tenantId,
  unitId,
  value,
  fallbackDocument,
  disabled,
  onChange,
}: SharedProps) {
  const query = useTtnsListQuery({
    tenantId,
    enabled: Boolean(tenantId && unitId),
    params: {
      unit_id: unitId,
      status: "active",
      limit: DEFAULT_TTNS_LIST_LIMIT,
      offset: 0,
      sort: "number",
      order: "asc",
    },
  });

  return (
    <DocumentComboboxView
      kind="ttn"
      items={query.items}
      loading={query.loading}
      value={value}
      fallbackDocument={fallbackDocument}
      disabled={disabled}
      onChange={onChange}
      refetch={() => void query.refetch()}
      refreshing={query.refreshing}
    />
  );
}

type DocumentComboboxProps = SharedProps &
  (
    | { kind: Extract<OperationDocumentKind, "passport">; wasteId: string }
    | { kind: Extract<OperationDocumentKind, "ttn"> }
  );

export function DocumentCombobox(props: DocumentComboboxProps) {
  if (props.kind === "passport") {
    return <PassportDocumentCombobox {...props} />;
  }
  return <TtnDocumentCombobox {...props} />;
}
