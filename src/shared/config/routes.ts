/**
 * Единственный источник URL-путей.
 *
 * Ключ (`routes.directories.standards`) — домен, совпадает с entity/API.
 * Сегмент в `directoryPath("standards")` — то, что видно в адресной строке.
 * Сменить `/directories/norms` ↔ `/directories/standards` = одно место.
 *
 * Литеральные типы сохраняются: `Link to={routes.directories.standards.detail}`
 * даёт те же параметры, что и строка `"/directories/standards/$standardId"`.
 */

function directoryPath<const Slug extends string>(
  slug: Slug,
): `/directories/${Slug}` {
  return `/directories/${slug}`;
}

function wastePath<const Slug extends string>(slug: Slug): `/waste/${Slug}` {
  return `/waste/${slug}`;
}

function crud<const Base extends string, const Param extends string>(
  base: Base,
  param: Param,
): {
  list: Base;
  new: `${Base}/new`;
  detail: `${Base}/$${Param}`;
} {
  return {
    list: base,
    new: `${base}/new`,
    detail: `${base}/$${param}`,
  };
}

function listDetail<const Base extends string, const Param extends string>(
  base: Base,
  param: Param,
): {
  list: Base;
  detail: `${Base}/$${Param}`;
} {
  return {
    list: base,
    detail: `${base}/$${param}`,
  };
}

export const routes = {
  home: "/",
  forbidden: "/forbidden",
  directories: {
    index: "/directories",
    instructions: crud(directoryPath("instructions"), "instructionId"),
    units: crud(directoryPath("units"), "unitId"),
    wastes: crud(directoryPath("wastes"), "wasteId"),
    wasteSources: { list: directoryPath("waste-sources") },
    counterparties: crud(directoryPath("counterparties"), "counterpartyId"),
    contracts: crud(directoryPath("contracts"), "contractId"),
    permits: crud(directoryPath("permits"), "permitId"),
    limits: { list: directoryPath("limits") },
    standards: crud(directoryPath("standards"), "standardId"),
    orders: crud(directoryPath("orders"), "orderId"),
    persons: { list: directoryPath("persons") },
  },
  waste: {
    operations: listDetail(wastePath("operations"), "operationId"),
    passports: crud(wastePath("passports"), "passportId"),
    ttns: crud(wastePath("ttns"), "ttnId"),
    /** Пункт меню есть, экрана нет — 404. */
    balances: wastePath("balances"),
  },
  reports: {
    pod9: "/reports/pod-9",
    pod10: "/reports/pod-10",
    stat1Waste: "/reports/1-waste",
  },
} as const;
