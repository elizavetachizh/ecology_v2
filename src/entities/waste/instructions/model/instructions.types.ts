const InstructionStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const InstructionStatusValues = Object.values(InstructionStatus);
export type InstructionStatus =
  (typeof InstructionStatus)[keyof typeof InstructionStatus];

export type Instruction = {
  id: string;
  tenant_id: string;
  name: string;
  short_name?: string;
  start_date?: string;
  end_date?: string;
  status: InstructionStatus;
};

export type InstructionListResponse = {
  total: number;
  limit: number;
  offset: number;
  items: Instruction[];
};

export const INSTRUCTION_STATUS_LABEL: Record<Instruction["status"], string> = {
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
