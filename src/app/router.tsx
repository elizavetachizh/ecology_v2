import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "./layout/AppLayout";
import { HomePage } from "../pages/dashboard/HomePage";
import { WasteOperationsPage } from "../pages/dashboard/waste/operations";
import { DirectoriesHubPage } from "../pages/dashboard/directories";
import { DirectoriesStructurePage } from "../pages/dashboard/directories/structure";
import { CreatePod9Page } from "../pages/dashboard/directories/create-pod9";
import { Pod9Page } from "../pages/dashboard/directories/pod9";
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
import { WasteDetailPage } from "../pages/dashboard/directories/waste-detail";

const rootRoute = createRootRoute({
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
};

const directoriesStructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/structure",
  validateSearch: (search: Record<string, unknown>): StructureSearch => ({
    focusId: typeof search.focusId === "string" ? search.focusId : undefined,
    expandId: typeof search.expandId === "string" ? search.expandId : undefined,
  }),
  component: DirectoriesStructurePage,
});

type CreateUnitSearch = {
  parentId: string;
};

const directoriesCreateUnitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/structure/units/new",
  validateSearch: (search: Record<string, unknown>): CreateUnitSearch => ({
    parentId: typeof search.parentId === "string" ? search.parentId : "",
  }),
  component: CreateUnitPage,
});

const directoriesEditUnitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/structure/units/$unitId",
  component: EditUnitPage,
});

type CreatePod9Search = {
  parentId: string;
};

const directoriesCreatePod9Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/structure/pod9/new",
  validateSearch: (search: Record<string, unknown>): CreatePod9Search => ({
    parentId: typeof search.parentId === "string" ? search.parentId : "",
  }),
  component: CreatePod9Page,
});

const directoriesPod9Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/structure/pod9/$pod9Id",
  component: Pod9Page,
});

const directoriesDepartmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/departments",
  component: () => <DirectoryStubPage title="Подразделения" />,
});

const directoriesWastesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/wastes",
  component: WastesDirectoryPage,
});

const directoriesCreateWasteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/wastes/new",
  component: CreateWastePage,
});

type WasteDetailSearch = {
  created?: boolean;
};

const directoriesWasteDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/wastes/$wasteId",
  validateSearch: (search: Record<string, unknown>): WasteDetailSearch => ({
    created: search.created === true || search.created === "true",
  }),
  component: WasteDetailPage,
});

const directoriesWasteEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/wastes/$wasteId/edit",
  component: EditWastePage,
});

const directoriesLimitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/limits",
  component: () => <DirectoryStubPage title="Лимиты накопления" />,
});

const directoriesNormsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/norms",
  component: () => <DirectoryStubPage title="Нормативы" />,
});

const directoriesInstructionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/instructions",
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

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$",
  component: HomePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  wasteOperationsRoute,
  directoriesRoute,
  directoriesStructureRoute,
  directoriesCreateUnitRoute,
  directoriesEditUnitRoute,
  directoriesCreatePod9Route,
  directoriesPod9Route,
  directoriesDepartmentsRoute,
  directoriesWastesRoute,
  directoriesCreateWasteRoute,
  directoriesWasteEditRoute,
  directoriesWasteDetailRoute,
  directoriesLimitsRoute,
  directoriesNormsRoute,
  directoriesInstructionsRoute,
  directoriesCreateInstructionRoute,
  directoriesEditInstructionRoute,
  catchAllRoute,
]);

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
