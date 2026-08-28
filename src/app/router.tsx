import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  retainSearchParams,
} from "@tanstack/react-router";
import type { AuthContextValue } from "../shared/auth/auth.types";
import { AppLayout } from "./layout/AppLayout";
import { HomePage } from "../pages/dashboard/HomePage";
import { WasteOperationsPage } from "../pages/dashboard/waste/operations";
import { EditOperationPage } from "../pages/dashboard/waste/operations/EditOperationPage";
import { PassportsPage } from "../pages/dashboard/waste/passports/PassportsPage";
import { CreatePassportPage } from "../pages/dashboard/waste/passports/CreatePassportPage";
import { EditPassportPage } from "../pages/dashboard/waste/passports/EditPassportPage";
import { TtnsPage } from "../pages/dashboard/waste/ttns/TtnsPage";
import { CreateTtnPage } from "../pages/dashboard/waste/ttns/CreateTtnPage";
import { EditTtnPage } from "../pages/dashboard/waste/ttns/EditTtnPage";
import { DirectoriesHubPage } from "../pages/dashboard/directories";
import { UnitsPage } from "../pages/dashboard/waste/units/UnitsPage";
import { EditUnitPage } from "../pages/dashboard/waste/units/EditUnitPage";
import { DirectoryStubPage } from "../pages/dashboard/directories/DirectoryStubPage";
import { InstructionsPage } from "../pages/dashboard/waste/instructions/InstructionsPage";
import { EditInstructionPage } from "../pages/dashboard/waste/instructions/EditInstructionPage";
import { WastesDirectoryPage } from "../pages/dashboard/waste/wastes/WastesPage";
import { EditWastePage } from "../pages/dashboard/waste/wastes/EditWastePage";
import { WasteSourcesPage } from "../pages/dashboard/waste/waste-sources/WasteSourcesPage";
import { CounterpartiesPage } from "../pages/dashboard/waste/counterparties/CounterpartiesPage";
import { ContractsPage } from "../pages/dashboard/waste/contracts/ContractsPage";
import { CreateContractPage } from "../pages/dashboard/waste/contracts/CreateContractPage";
import { EditContractPage } from "../pages/dashboard/waste/contracts/EditContractPage";
import { PermitsPage } from "../pages/dashboard/waste/permits/PermitsPage";
import { CreatePermitPage } from "../pages/dashboard/waste/permits/CreatePermitPage";
import { EditPermitPage } from "../pages/dashboard/waste/permits/EditPermitPage";
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
import { CounterpartySortFields } from "../entities/waste/counterparties";
import {
  ContractSortFields,
  ContractStatusValues,
  ContractTypeValues,
} from "../entities/waste/contracts";
import {
  PermitSortFields,
  PermitStatusValues,
} from "../entities/waste/permits";
import {
  PassportSortFields,
  PassportStatusValues,
  PassportTransportTypeValues,
} from "../entities/waste/passports";
import { TtnSortFields, TtnStatusValues } from "../entities/waste/ttns";
import { WasteSourceSortFields } from "../entities/waste/waste-sources";
import {
  parseSearchBoolean,
  parseSearchEnum,
  parseSearchIsoDate,
  parseSearchLimit,
  parseSearchOffset,
  parseSearchOrder,
  parseSearchQuery,
  parseRootSearch,
  type InstructionsSearch,
  type OperationsSearch,
  type PassportsSearch,
  type CreatePassportSearch,
  type CreateTtnSearch,
  type TtnsSearch,
  type RouterContext,
  type StructureSearch,
  type CounterpartiesSearch,
  type ContractsSearch,
  type PermitsSearch,
  type WasteSourcesSearch,
  type WastesSearch,
  type PersonsSearch,
} from "./router/search-params";
import { CreateUnitPage } from "../pages/dashboard/waste/units/CreateUnitPage";
import { CreateWastePage } from "../pages/dashboard/waste/wastes/CreateWastePage";
import { CreateInstructionPage } from "../pages/dashboard/waste/instructions/CreateInstructionPage";
import { PersonsPage } from "../pages/dashboard/waste/persons/PersonsPage";
import { PersonSortFields } from "../entities/waste/persons";

const rootRoute = createRootRouteWithContext<RouterContext>()({
  validateSearch: parseRootSearch,
  search: {
    middlewares: [retainSearchParams(["tenant"])],
  },
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

const wasteEditOperationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste/operations/$operationId",
  component: EditOperationPage,
});

const wastePassportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste/passports",
  validateSearch: (search: Record<string, unknown>): PassportsSearch => ({
    q: parseSearchQuery(search.q),
    status: parseSearchEnum(search.status, PassportStatusValues),
    transport_type: parseSearchEnum(
      search.transport_type,
      PassportTransportTypeValues,
    ),
    unit_id: parseSearchQuery(search.unit_id),
    recycling_contract_id: parseSearchQuery(search.recycling_contract_id),
    date_from: parseSearchIsoDate(search.date_from),
    date_to: parseSearchIsoDate(search.date_to),
    sort: parseSearchEnum(search.sort, PassportSortFields),
    order: parseSearchOrder(search.order),
    limit: parseSearchLimit(search.limit),
    offset: parseSearchOffset(search.offset),
  }),
  component: PassportsPage,
});

const wasteCreatePassportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste/passports/new",
  validateSearch: (search: Record<string, unknown>): CreatePassportSearch => ({
    recycling_contract_id: parseSearchQuery(search.recycling_contract_id),
  }),
  component: CreatePassportPage,
});

const wasteEditPassportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste/passports/$passportId",
  component: EditPassportPage,
});

const wasteTtnsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste/ttns",
  validateSearch: (search: Record<string, unknown>): TtnsSearch => ({
    q: parseSearchQuery(search.q),
    status: parseSearchEnum(search.status, TtnStatusValues),
    unit_id: parseSearchQuery(search.unit_id),
    recycling_contract_id: parseSearchQuery(search.recycling_contract_id),
    date_from: parseSearchIsoDate(search.date_from),
    date_to: parseSearchIsoDate(search.date_to),
    sort: parseSearchEnum(search.sort, TtnSortFields),
    order: parseSearchOrder(search.order),
    limit: parseSearchLimit(search.limit),
    offset: parseSearchOffset(search.offset),
  }),
  component: TtnsPage,
});

const wasteCreateTtnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste/ttns/new",
  validateSearch: (search: Record<string, unknown>): CreateTtnSearch => ({
    recycling_contract_id: parseSearchQuery(search.recycling_contract_id),
  }),
  component: CreateTtnPage,
});

const wasteEditTtnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/waste/ttns/$ttnId",
  component: EditTtnPage,
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

const directoriesPersonsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/persons",
  validateSearch: (search: Record<string, unknown>): PersonsSearch => {
    return {
      q: parseSearchQuery(search.q),
      sort: parseSearchEnum(search.sort, PersonSortFields),
      order: parseSearchOrder(search.order),
      limit: parseSearchLimit(search.limit),
      offset: parseSearchOffset(search.offset),
    };
  },
  component: PersonsPage,
});

const directoriesCounterpartiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/counterparties",
  validateSearch: (search: Record<string, unknown>): CounterpartiesSearch => {
    return {
      q: parseSearchQuery(search.q),
      is_individual: parseSearchBoolean(search.is_individual),
      is_active: parseSearchBoolean(search.is_active),
      sort: parseSearchEnum(search.sort, CounterpartySortFields),
      order: parseSearchOrder(search.order),
      limit: parseSearchLimit(search.limit),
      offset: parseSearchOffset(search.offset),
    };
  },
  component: CounterpartiesPage,
});

const directoriesContractsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/contracts",
  validateSearch: (search: Record<string, unknown>): ContractsSearch => {
    return {
      q: parseSearchQuery(search.q),
      status: parseSearchEnum(search.status, ContractStatusValues),
      contract_type: parseSearchEnum(search.contract_type, ContractTypeValues),
      counterparty_id: parseSearchQuery(search.counterparty_id),
      sort: parseSearchEnum(search.sort, ContractSortFields),
      order: parseSearchOrder(search.order),
      limit: parseSearchLimit(search.limit),
      offset: parseSearchOffset(search.offset),
    };
  },
  component: ContractsPage,
});

const directoriesCreateContractRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/contracts/new",
  component: CreateContractPage,
});

const directoriesEditContractRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/contracts/$contractId",
  component: EditContractPage,
});

const directoriesPermitsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/permits",
  validateSearch: (search: Record<string, unknown>): PermitsSearch => {
    return {
      q: parseSearchQuery(search.q),
      status: parseSearchEnum(search.status, PermitStatusValues),
      unit_id: parseSearchQuery(search.unit_id),
      sort: parseSearchEnum(search.sort, PermitSortFields),
      order: parseSearchOrder(search.order),
      limit: parseSearchLimit(search.limit),
      offset: parseSearchOffset(search.offset),
    };
  },
  component: PermitsPage,
});

const directoriesCreatePermitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/permits/new",
  component: CreatePermitPage,
});

const directoriesEditPermitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/directories/permits/$permitId",
  component: EditPermitPage,
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
  wasteEditOperationRoute,
  wastePassportsRoute,
  wasteCreatePassportRoute,
  wasteEditPassportRoute,
  wasteTtnsRoute,
  wasteCreateTtnRoute,
  wasteEditTtnRoute,
  directoriesRoute,
  directoriesStructureRoute,
  directoriesCreateUnitRoute,
  directoriesEditUnitRoute,
  directoriesWastesRoute,
  directoriesCreateWasteRoute,
  directoriesWasteEditRoute,
  directoriesWasteSourcesRoute,
  directoriesPersonsRoute,
  directoriesCounterpartiesRoute,
  directoriesContractsRoute,
  directoriesCreateContractRoute,
  directoriesEditContractRoute,
  directoriesPermitsRoute,
  directoriesCreatePermitRoute,
  directoriesEditPermitRoute,
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
