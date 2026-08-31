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
import { routes } from "../../shared/config/routes";

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
      path: routes.directories.wastes.list,
      component: () => null,
    });
    const createPageRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: routes.directories.wastes.new,
      component: () => null,
    });
    const history = createMemoryHistory({
      initialEntries: [`${routes.directories.wastes.list}?tenant=org-1`],
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([listRoute, createPageRoute]),
      history,
    });

    await router.load();
    expect(router.state.location.search.tenant).toBe("org-1");

    await router.navigate({ to: routes.directories.wastes.new });
    expect(router.state.location.pathname).toBe(routes.directories.wastes.new);
    expect(router.state.location.search.tenant).toBe("org-1");
  });
});
