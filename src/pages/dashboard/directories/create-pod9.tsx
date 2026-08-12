import { Navigate } from "@tanstack/react-router";

/**
 * Legacy mock create-POD-9 page.
 * Redirect to unit create with is_pod9 prefilled.
 */
export function CreatePod9Page() {
  const parentId =
    typeof window !== "undefined"
      ? (new URLSearchParams(window.location.search).get("parentId") ?? "")
      : "";

  return (
    <Navigate
      to="/directories/structure/units/new"
      search={{ parentId, isPod9: true }}
      replace
    />
  );
}
