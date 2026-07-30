import { Link, useSearch } from "@tanstack/react-router";
import { CreatePod9Form } from "../../../features/directories/create-structure-node";
import { Alert, AlertDescription, Button } from "../../../shared/ui";
import {
  findStructureNode,
  getStructureTree,
  insertPod9,
} from "./model/structure.store";

export function CreatePod9Page() {
  const { parentId } = useSearch({
    from: "/directories/structure/pod9/new",
  });

  const parent = parentId
    ? findStructureNode(getStructureTree(), parentId)
    : null;

  if (!parentId || !parent || parent.type !== "unit") {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Alert variant="error">
          <AlertDescription>
            Не удалось определить структурную единицу. Откройте создание ПОД-9
            с карточки единицы.
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline" size="sm">
          <Link to="/directories/structure">К структуре</Link>
        </Button>
      </div>
    );
  }

  return (
    <CreatePod9Form
      parentId={parentId}
      parentLabel={`${parent.name}${parent.code ? ` (${parent.code})` : ""}`}
      onCreated={(result) => {
        insertPod9({
          id: result.id,
          name: result.name,
          period: result.period,
          status: result.status,
          responsible: result.responsible,
          parentId: result.parentId,
        });
      }}
    />
  );
}
