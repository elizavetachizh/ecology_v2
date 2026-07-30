import { useState, useSyncExternalStore } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Alert, AlertDescription, Button } from "../../../shared/ui";
import {
  findParentId,
  findStructureNode,
  getStructureTree,
  subscribeStructure,
} from "./model/structure.store";
import {
  getPod9Wastes,
  getPod9WastesSnapshot,
  subscribePod9Wastes,
} from "./model/pod9-wastes.store";
import { Pod9WastesSection } from "./ui/Pod9WastesSection";

export function Pod9Page() {
  const { pod9Id } = useParams({
    from: "/directories/structure/pod9/$pod9Id",
  });

  useSyncExternalStore(subscribeStructure, getStructureTree, getStructureTree);
  useSyncExternalStore(
    subscribePod9Wastes,
    getPod9WastesSnapshot,
    getPod9WastesSnapshot,
  );

  const [, setTick] = useState(0);
  const pod9 = findStructureNode(getStructureTree(), pod9Id);
  const parentId = findParentId(getStructureTree(), pod9Id);
  const wastes = getPod9Wastes(pod9Id);

  if (!pod9 || pod9.type !== "pod9") {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Alert variant="error">
          <AlertDescription>Журнал ПОД-9 не найден.</AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/structure">К структуре</Link>
        </Button>
      </div>
    );
  }

  const parent =
    typeof parentId === "string"
      ? findStructureNode(getStructureTree(), parentId)
      : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {pod9.name}
            </h1>
            <span className="inline-flex rounded-md bg-info-muted px-2 py-0.5 text-xs font-medium text-info">
              ПОД-9
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {parent ? (
              <>
                Структурная единица:{" "}
                <Link
                  to="/directories/structure/units/$unitId"
                  params={{ unitId: parent.id }}
                  className="font-medium text-foreground hover:underline"
                >
                  {parent.name}
                  {parent.code ? ` (${parent.code})` : ""}
                </Link>
              </>
            ) : (
              "Карточка журнала ПОД-9"
            )}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/structure">К структуре</Link>
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <div>
          <div className="text-xs text-muted-foreground">Период</div>
          <div className="text-sm font-medium">{pod9.period ?? "—"}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Статус</div>
          <div className="text-sm font-medium">{pod9.status ?? "—"}</div>
        </div>
        <div className="sm:col-span-2">
          <div className="text-xs text-muted-foreground">Ответственный</div>
          <div className="text-sm font-medium">
            {pod9.responsible?.trim() ? pod9.responsible : "—"}
          </div>
        </div>
      </div>

      <Pod9WastesSection
        pod9Id={pod9Id}
        wastes={wastes}
        onChanged={() => setTick((n) => n + 1)}
      />
    </div>
  );
}
