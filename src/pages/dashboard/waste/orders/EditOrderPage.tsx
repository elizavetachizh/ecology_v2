import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "../../../../entities/tenant";
import { getOrder, ordersQueryKeys } from "../../../../entities/waste/orders";
import { OrderForm } from "../../../../features/waste/upsert-order";
import {
  AlertDetailPageError,
  TenantRequiredGate,
  toast,
} from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function EditOrderPage() {
  const { orderId } = useParams({
    from: routes.directories.orders.detail,
  });
  const navigate = useNavigate({
    from: routes.directories.orders.detail,
  });
  const { activeTenantId } = useTenant();

  const orderQuery = useQuery({
    queryKey: ordersQueryKeys.detail(activeTenantId ?? "none", orderId),
    queryFn: ({ signal }) => getOrder(orderId, signal),
    enabled: Boolean(activeTenantId),
  });

  if (orderQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <AlertDetailPageError
        directoryTo={routes.directories.orders.list}
        linkLabel="К приказам"
        description="Приказ не найден."
      />
    );
  }

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Чтобы открыть приказ, выберите организацию в верхней панели."
    >
      <OrderForm
        mode="edit"
        orderId={orderId}
        initial={orderQuery.data}
        onSaved={(_order, { close }) => {
          toast.success("Приказ успешно обновлён");
          if (close) void navigate({ to: routes.directories.orders.list });
        }}
        onCancel={() => void navigate({ to: routes.directories.orders.list })}
      />
    </TenantRequiredGate>
  );
}
