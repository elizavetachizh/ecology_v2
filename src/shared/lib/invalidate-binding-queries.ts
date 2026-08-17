import { uiwQueryKeys } from "../../entities/waste/unit-instruction-waste";
import { wiuQueryKeys } from "../../entities/waste/waste-instruction-units";
import { queryClient } from "./query-client";

/** UIW и WIU — зеркальные входы в одну привязку. */
export function invalidateBindingQueries() {
  void queryClient.invalidateQueries({ queryKey: uiwQueryKeys.all });
  void queryClient.invalidateQueries({ queryKey: wiuQueryKeys.all });
}
