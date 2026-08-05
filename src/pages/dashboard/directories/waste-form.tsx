import { useEffect } from "react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { WasteCatalogForm } from "../../../features/waste/upsert-waste";

export function CreateWastePage() {
  const search = useSearch({ from: "/directories/wastes/new" });
  const navigate = useNavigate();
  const instructionId = search.instructionId;

  return (
    <WasteCatalogForm
      mode="create"
      initialInstructionId={instructionId}
      onCreated={(waste) => {
        void navigate({
          to: "/directories/wastes/$wasteId",
          params: { wasteId: waste.id },
          search: { created: true, instructionId: waste.instructionId },
        });
      }}
      onCancel={() => {
        void navigate({
          to: "/directories/wastes",
          search: { instructionId: instructionId || undefined },
        });
      }}
    />
  );
}

export function EditWastePage() {
  const { wasteId } = useParams({ from: "/directories/wastes/$wasteId/edit" });
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({
      to: "/directories/wastes/$wasteId",
      params: { wasteId },
      replace: true,
    });
  }, [navigate, wasteId]);

  return null;
}
