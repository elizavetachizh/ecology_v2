import type {
  Order,
  OrderCreate,
  OrderUpdate,
} from "../../../../entities/waste/orders";
import type { OrderFormValues } from "./order-form.schema";

export function toOrderWriteBody(values: OrderFormValues): OrderCreate {
  return {
    number: values.number.trim(),
    start_date: values.start_date,
    unit_id: values.unit_id,
  };
}

export function toOrderUpdateBody(values: OrderFormValues): OrderUpdate {
  return toOrderWriteBody(values);
}

export function toOrderFormValues(order: Order): OrderFormValues {
  return {
    number: order.number,
    start_date: order.start_date,
    unit_id: order.unit_id,
  };
}
