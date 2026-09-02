import { useNavigate } from "@tanstack/react-router";
import { useTenant } from "../../../../entities/tenant";
import { OrderForm } from "../../../../features/waste/upsert-order";
import { TenantRequiredGate, toast } from "../../../../shared/ui";
import { routes } from "../../../../shared/config/routes";

export function CreateOrderPage() {
  const navigate = useNavigate();
  const { activeTenantId } = useTenant();

  return (
    <TenantRequiredGate
      tenantId={activeTenantId}
      description="Создание приказа доступно после выбора организации в верхней панели."
    >
      <OrderForm
        mode="create"
        onSaved={(order, { close }) => {
          toast.success("Приказ успешно создан");
          if (close) {
            void navigate({ to: routes.directories.orders.list });
            return;
          }
          void navigate({
            to: routes.directories.orders.detail,
            params: { orderId: order.id },
            replace: true,
          });
        }}
        onCancel={() => void navigate({ to: routes.directories.orders.list })}
      />
    </TenantRequiredGate>
  );
}
