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
import { DirectoriesStructurePage } from "../pages/dashboard/directories/structure";
import {
  CreateUnitPage,
  EditUnitPage,
} from "../pages/dashboard/directories/unit-pages";
import { DirectoryStubPage } from "../pages/dashboard/directories/DirectoryStubPage";
import { InstructionsPage } from "../pages/dashboard/directories/instructions";
import {
  CreateInstructionPage,
  EditInstructionPage,
} from "../pages/dashboard/directories/instruction-form";
import { WastesDirectoryPage } from "../pages/dashboard/directories/wastes";
import {
  CreateWastePage,
  EditWastePage,
} from "../pages/dashboard/directories/waste-form";
import { WasteSourcesPage } from "../pages/dashboard/directories/waste-sources";
import { Pod9ReportPage } from "../pages/dashboard/reports/pod9";
import { ForbiddenPage } from "../pages/system/ForbiddenPage";
import { NotFoundPage } from "../pages/system/NotFoundPage";
import {
  InstructionSortFields,
  type InstructionSortField,
  type InstructionSortOrder,
  type InstructionStatus,
} from "../entities/waste/instructions";
import {
  HazardClassValues,
  PhysicalStateValues,
  WasteSortFields,
  type HazardClass,
  type PhysicalState,
  type WasteSortField,
  type WasteSortOrder,
} from "../entities/waste/wastes";
import {
  WasteSourceSortFields,
  type WasteSourceSortField,
  type WasteSourceSortOrder,
} from "../entities/waste/waste-sources";

export type RouterContext = {
  auth: AuthContextValue;
};

type InstructionsSearch = {
  q?: string;
  status?: InstructionStatus;
  sort?: InstructionSortField;
  order?: InstructionSortOrder;
  limit?: number;
  offset?: number;
};

type WastesSearch = {
  q?: string;
  hazard_class?: HazardClass;
  physical_state?: PhysicalState;
  sort?: WasteSortField;
  order?: WasteSortOrder;
  limit?: number;
  offset?: number;
};

type WasteSourcesSearch = {
  q?: string;
  sort?: WasteSourceSortField;
  order?: WasteSourceSortOrder;
  limit?: number;
  offset?: number;
};

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
  component: WasteOperationsPage,
});

const directoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories",
  component: DirectoriesHubPage,
});

type StructureSearch = {
  focusId?: string;
  expandId?: string;
  q?: string;
};

const directoriesStructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/structure",
  validateSearch: (search: Record<string, unknown>): StructureSearch => ({
    focusId: typeof search.focusId === "string" ? search.focusId : undefined,
    expandId: typeof search.expandId === "string" ? search.expandId : undefined,
    q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
  }),
  component: DirectoriesStructurePage,
});

type CreateUnitSearch = {
  parentId: string;
  isPod9?: boolean;
};

const directoriesCreateUnitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/structure/units/new",
  validateSearch: (search: Record<string, unknown>): CreateUnitSearch => ({
    parentId: typeof search.parentId === "string" ? search.parentId : "",
    isPod9: search.isPod9 === true || search.isPod9 === "true",
  }),
  component: CreateUnitPage,
});

const directoriesEditUnitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/structure/units/$unitId",
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
    const sortRaw = search.sort;
    const sort =
      typeof sortRaw === "string" &&
      WasteSortFields.includes(sortRaw as WasteSortField)
        ? (sortRaw as WasteSortField)
        : undefined;

    const orderRaw = search.order;
    const order =
      orderRaw === "asc" || orderRaw === "desc" ? orderRaw : undefined;

    const hazardRaw = search.hazard_class;
    const hazard_class =
      typeof hazardRaw === "string" &&
      HazardClassValues.includes(hazardRaw as HazardClass)
        ? (hazardRaw as HazardClass)
        : undefined;

    const physicalRaw = search.physical_state;
    const physical_state =
      typeof physicalRaw === "string" &&
      PhysicalStateValues.includes(physicalRaw as PhysicalState)
        ? (physicalRaw as PhysicalState)
        : undefined;

    const limitRaw = Number(search.limit);
    const offsetRaw = Number(search.offset);

    return {
      q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
      hazard_class,
      physical_state,
      sort,
      order,
      limit:
        Number.isFinite(limitRaw) && limitRaw >= 1 && limitRaw <= 200
          ? Math.floor(limitRaw)
          : undefined,
      offset:
        Number.isFinite(offsetRaw) && offsetRaw >= 0
          ? Math.floor(offsetRaw)
          : undefined,
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
    const sortRaw = search.sort;
    const sort =
      typeof sortRaw === "string" &&
      WasteSourceSortFields.includes(sortRaw as WasteSourceSortField)
        ? (sortRaw as WasteSourceSortField)
        : undefined;

    const orderRaw = search.order;
    const order =
      orderRaw === "asc" || orderRaw === "desc" ? orderRaw : undefined;

    const limitRaw = Number(search.limit);
    const offsetRaw = Number(search.offset);

    return {
      q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
      sort,
      order,
      limit:
        Number.isFinite(limitRaw) && limitRaw >= 1 && limitRaw <= 200
          ? Math.floor(limitRaw)
          : undefined,
      offset:
        Number.isFinite(offsetRaw) && offsetRaw >= 0
          ? Math.floor(offsetRaw)
          : undefined,
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

    const sortRaw = search.sort;
    const sort =
      typeof sortRaw === "string" &&
      InstructionSortFields.includes(sortRaw as InstructionSortField)
        ? (sortRaw as InstructionSortField)
        : undefined;

    const orderRaw = search.order;
    const order =
      orderRaw === "asc" || orderRaw === "desc" ? orderRaw : undefined;

    const limitRaw = Number(search.limit);
    const offsetRaw = Number(search.offset);

    return {
      q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
      status,
      sort,
      order,
      limit:
        Number.isFinite(limitRaw) && limitRaw >= 1 && limitRaw <= 200
          ? Math.floor(limitRaw)
          : undefined,
      offset:
        Number.isFinite(offsetRaw) && offsetRaw >= 0
          ? Math.floor(offsetRaw)
          : undefined,
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
