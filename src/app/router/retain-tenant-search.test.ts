import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  retainSearchParams,
} from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { parseRootSearch } from "./search-params";

describe("retain tenant search param", () => {
  it("keeps tenant when navigating without search", async () => {
    const rootRoute = createRootRoute({
      validateSearch: parseRootSearch,
      search: {
        middlewares: [retainSearchParams(["tenant"])],
      },
      component: Outlet,
    });
    const listRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/directories/wastes",
      component: () => null,
    });
    const createPageRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: "/directories/wastes/new",
      component: () => null,
    });
    const history = createMemoryHistory({
      initialEntries: ["/directories/wastes?tenant=org-1"],
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([listRoute, createPageRoute]),
      history,
    });

    await router.load();
    expect(router.state.location.search.tenant).toBe("org-1");

    await router.navigate({ to: "/directories/wastes/new" });
    expect(router.state.location.pathname).toBe("/directories/wastes/new");
    expect(router.state.location.search.tenant).toBe("org-1");
  });
});
