import { useParams, useSearch } from "@tanstack/react-router";
import { UnitFormPage } from "./ui/UnitFormPage";

export function CreateUnitPage() {
  const { parentId } = useSearch({
    from: "/directories/structure/units/new",
  });

  return (
    <UnitFormPage
      mode="create"
      parentId={parentId && parentId.length > 0 ? parentId : null}
    />
  );
}

export function EditUnitPage() {
  const { unitId } = useParams({
    from: "/directories/structure/units/$unitId",
  });

  return <UnitFormPage mode="edit" unitId={unitId} />;
}
