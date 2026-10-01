import { userProfileFixture } from "../../persons";
import type { WasteSource } from "../model/waste-sources.types";

export const wasteSourceFixture: WasteSource = {
  id: "ws-1",
  tenant_id: "tenant-1",
  name: "Цех №3",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  created_by: userProfileFixture,
  updated_by: userProfileFixture,
};
