import { Navigate } from "@tanstack/react-router";

/** Legacy mock POD-9 page — redirect to MDM units structure. */
export function Pod9Page() {
  return <Navigate to="/directories/structure" replace />;
}
