import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { AuthContextValue } from "../shared/auth/auth.types";
import { AppLayout } from "./layout/AppLayout";
import { HomePage } from "../pages/dashboard/HomePage";
import { WasteOperationsPage } from "../pages/dashboard/waste/operations";
import { DirectoriesHubPage } from "../pages/dashboard/directories";
import { UnitsPage } from "../pages/dashboard/waste/units/UnitsPage";
import { EditUnitPage } from "../pages/dashboard/waste/units/EditUnitPage";
import { DirectoryStubPage } from "../pages/dashboard/directories/DirectoryStubPage";
import { InstructionsPage } from "../pages/dashboard/waste/instructions/InstructionsPage";
import { EditInstructionPage } from "../pages/dashboard/waste/instructions/EditInstructionPage";
import { WastesDirectoryPage } from "../pages/dashboard/waste/wastes/WastesPage";
import { EditWastePage } from "../pages/dashboard/waste/wastes/EditWastePage";
import { WasteSourcesPage } from "../pages/dashboard/waste/waste-sources/WasteSourcesPage";
import { Pod9ReportPage } from "../pages/dashboard/reports/pod9";
import { ForbiddenPage } from "../pages/system/ForbiddenPage";
import { NotFoundPage } from "../pages/system/NotFoundPage";
import { InstructionSortFields } from "../entities/waste/instructions";
import { OperationTypeValues } from "../entities/waste/operations";
import { UnitSortFields } from "../entities/waste/units";
import {
  HazardClassValues,
  PhysicalStateValues,
  WasteSortFields,
} from "../entities/waste/wastes";
import { WasteSourceSortFields } from "../entities/waste/waste-sources";
import {
  parseSearchBoolean,
  parseSearchEnum,
  parseSearchIsoDate,
  parseSearchLimit,
  parseSearchOffset,
  parseSearchOrder,
  parseSearchQuery,
  type InstructionsSearch,
  type OperationsSearch,
  type RouterContext,
  type StructureSearch,
  type WasteSourcesSearch,
  type WastesSearch,
} from "./router/search-params";
import { CreateUnitPage } from "../pages/dashboard/waste/units/CreateUnitPage";
import { CreateWastePage } from "../pages/dashboard/waste/wastes/CreateWastePage";
import { CreateInstructionPage } from "../pages/dashboard/waste/instructions/CreateInstructionPage";

const rootRoute = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    if (!context.auth.authenticated) await context.auth.login();
  },
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const wasteOperationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste/operations",
  validateSearch: (search: Record<string, unknown>): OperationsSearch => ({
    unit_id: parseSearchQuery(search.unit_id),
    waste_id: parseSearchQuery(search.waste_id),
    operation_type: parseSearchEnum(search.operation_type, OperationTypeValues),
    date_from: parseSearchIsoDate(search.date_from),
    date_to: parseSearchIsoDate(search.date_to),
    limit: parseSearchLimit(search.limit),
    offset: parseSearchOffset(search.offset),
  }),
  component: WasteOperationsPage,
});

const directoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories",
  component: DirectoriesHubPage,
});

const directoriesStructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/units",
  validateSearch: (search: Record<string, unknown>): StructureSearch => ({
    focusId: typeof search.focusId === "string" ? search.focusId : undefined,
    expandId: typeof search.expandId === "string" ? search.expandId : undefined,
    q: parseSearchQuery(search.q),
    sort: parseSearchEnum(search.sort, UnitSortFields),
    order: parseSearchOrder(search.order),
    is_pod9: parseSearchBoolean(search.is_pod9) === true ? true : undefined,
    limit: parseSearchLimit(search.limit),
    offset: parseSearchOffset(search.offset),
  }),
  component: UnitsPage,
});

type CreateUnitSearch = {
  parentId: string;
  isPod9?: boolean;
};

const directoriesCreateUnitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/units/new",
  validateSearch: (search: Record<string, unknown>): CreateUnitSearch => ({
    parentId: typeof search.parentId === "string" ? search.parentId : "",
    isPod9: search.isPod9 === true || search.isPod9 === "true",
  }),
  component: CreateUnitPage,
});

const directoriesEditUnitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/units/$unitId",
  validateSearch: (search: Record<string, unknown>) => ({
    instructionId:
      typeof search.instructionId === "string"
        ? search.instructionId
        : undefined,
  }),
  component: EditUnitPage,
});

const directoriesWastesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/wastes",
  validateSearch: (search: Record<string, unknown>): WastesSearch => {
    return {
      q: parseSearchQuery(search.q),
      hazard_class: parseSearchEnum(search.hazard_class, HazardClassValues),
      physical_state: parseSearchEnum(
        search.physical_state,
        PhysicalStateValues,
      ),
      sort: parseSearchEnum(search.sort, WasteSortFields),
      order: parseSearchOrder(search.order),
      limit: parseSearchLimit(search.limit),
      offset: parseSearchOffset(search.offset),
    };
  },
  component: WastesDirectoryPage,
});

const directoriesCreateWasteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/wastes/new",
  component: CreateWastePage,
});

const directoriesWasteEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/wastes/$wasteId",
  validateSearch: (search: Record<string, unknown>) => ({
    instructionId:
      typeof search.instructionId === "string"
        ? search.instructionId
        : undefined,
  }),
  component: EditWastePage,
});

const directoriesLimitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/limits",
  component: () => <DirectoryStubPage title="Лимиты накопления" />,
});

const directoriesWasteSourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/waste-sources",
  validateSearch: (search: Record<string, unknown>): WasteSourcesSearch => {
    return {
      q: parseSearchQuery(search.q),
      sort: parseSearchEnum(search.sort, WasteSourceSortFields),
      order: parseSearchOrder(search.order),
      limit: parseSearchLimit(search.limit),
      offset: parseSearchOffset(search.offset),
    };
  },
  component: WasteSourcesPage,
});

const directoriesNormsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/norms",
  component: () => <DirectoryStubPage title="Нормативы" />,
});

const directoriesInstructionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/instructions",
  validateSearch: (search: Record<string, unknown>): InstructionsSearch => {
    const statusRaw = search.status;
    const status =
      statusRaw === "draft" ||
      statusRaw === "active" ||
      statusRaw === "inactive"
        ? statusRaw
        : undefined;

    return {
      q: parseSearchQuery(search.q),
      status,
      sort: parseSearchEnum(search.sort, InstructionSortFields),
      order: parseSearchOrder(search.order),
      limit: parseSearchLimit(search.limit),
      offset: parseSearchOffset(search.offset),
    };
  },
  component: InstructionsPage,
});

const directoriesCreateInstructionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/instructions/new",
  component: CreateInstructionPage,
});

const directoriesEditInstructionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/instructions/$instructionId",
  component: EditInstructionPage,
});

const pod9ReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports/pod-9",
  component: Pod9ReportPage,
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forbidden",
  component: ForbiddenPage,
});

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: NotFoundPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  wasteOperationsRoute,
  directoriesRoute,
  directoriesStructureRoute,
  directoriesCreateUnitRoute,
  directoriesEditUnitRoute,
  directoriesWastesRoute,
  directoriesCreateWasteRoute,
  directoriesWasteEditRoute,
  directoriesWasteSourcesRoute,
  directoriesLimitsRoute,
  directoriesNormsRoute,
  directoriesInstructionsRoute,
  directoriesCreateInstructionRoute,
  directoriesEditInstructionRoute,
  pod9ReportRoute,
  forbiddenRoute,
  catchAllRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    auth: undefined as unknown as AuthContextValue,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
