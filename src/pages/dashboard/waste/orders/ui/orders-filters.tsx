import {
  ORDER_ALL_STATUS_LABEL,
  OrderAllStatusValues,
  type OrderStatus,
} from "../../../../../entities/waste/orders";
import { UnitSelect } from "../../../../../entities/waste/units";
import {
  ListSearchField,
  Tabs,
  TabsList,
  TabsTrigger,
} from "../../../../../shared/ui";

export type OrdersFiltersValue = {
  q?: string;
  status?: OrderStatus;
  unit_id?: string;
};

type OrdersFiltersProps = {
  tenantId: string | null;
  values: OrdersFiltersValue;
  onChange: (patch: OrdersFiltersValue) => void;
};

export function OrdersFilters({
  tenantId,
  values,
  onChange,
}: OrdersFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <ListSearchField
          value={values.q ?? ""}
          placeholder="Поиск по номеру"
          onSearch={(q) => onChange({ q: q || undefined })}
        />
        <div className="w-64">
          <UnitSelect
            tenantId={tenantId}
            value={values.unit_id ?? ""}
            placeholder="Все подразделения"
            onChange={(id) => onChange({ unit_id: id || undefined })}
          />
        </div>
      </div>
      <Tabs
        value={values.status ?? "all"}
        onValueChange={(value) =>
          onChange({
            status: value === "all" ? undefined : (value as OrderStatus),
          })
        }
        className="gap-0"
      >
        <TabsList aria-label="Статус приказа">
          {OrderAllStatusValues.map((status) => (
            <TabsTrigger key={status} value={status}>
              {ORDER_ALL_STATUS_LABEL[status]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </>
  );
}
