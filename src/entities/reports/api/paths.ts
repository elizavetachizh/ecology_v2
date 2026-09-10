export function reportsCollectionPath(): string {
  return "/api/v1/reports";
}

export function pod9ReportPath(): string {
  return `${reportsCollectionPath()}/pod-9`;
}

export function pod10ReportPath(): string {
  return `${reportsCollectionPath()}/pod-10`;
}
