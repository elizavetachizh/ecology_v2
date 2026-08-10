import type { UserProfile } from "../../../user";

const InstructionStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const InstructionStatusValues = Object.values(InstructionStatus);
export type InstructionStatus =
  (typeof InstructionStatus)[keyof typeof InstructionStatus];

/** Поля sort из GET /api/v1/mdm/instructions */
export const InstructionSortFields = [
  "name",
  "short_name",
  "status",
  "start_date",
  "end_date",
  "created_at",
  "id",
] as const;
export type InstructionSortField = (typeof InstructionSortFields)[number];

export type InstructionSortOrder = "asc" | "desc";

/** InstructionRead — ответ backend */
export type Instruction = {
  id: string;
  tenant_id: string;
  name: string;
  short_name: string | null;
  start_date: string | null;
  end_date: string | null;
  status: InstructionStatus;
  created_at: string;
  updated_at: string;
  created_by: UserProfile;
  updated_by: UserProfile;
};

export type InstructionListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Instruction[];
};

export const INSTRUCTION_STATUS_LABEL: Record<InstructionStatus, string> = {
  draft: "Черновик",
  active: "Действует",
  inactive: "Не действует",
};

export type InstructionCreate = {
  name: string;
  short_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: InstructionStatus;
};

export type InstructionUpdate = {
  name?: string;
  short_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: InstructionStatus;
};

export type GetInstructionsParams = {
  search?: string;
  status?: InstructionStatus;
  sort?: InstructionSortField;
  order?: InstructionSortOrder;
  limit: number;
  offset: number;
};

export const DEFAULT_INSTRUCTIONS_LIST_LIMIT = 50;
export const DEFAULT_INSTRUCTIONS_OPTIONS_LIMIT = 20;
