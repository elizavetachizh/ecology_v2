export type Instruction = {
  id: string;
  title: string;
  number: string;
  approvedAt: string;
  responsible: string;
  status: "draft" | "active";
};

export type InstructionFormValues = {
  title: string;
  number: string;
  approvedAt: string;
  responsible: string;
};

export function emptyInstructionForm(): InstructionFormValues {
  return {
    title: "",
    number: "",
    approvedAt: "",
    responsible: "",
  };
}

export const INSTRUCTION_STATUS_LABEL: Record<Instruction["status"], string> = {
  draft: "Черновик",
  active: "Действует",
};

type Listener = () => void;

/** Стартуем пустым: эколог сначала создаёт свой документ */
let instructions: Instruction[] = [];
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getInstructions(): Instruction[] {
  return instructions;
}

export function subscribeInstructions(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function findInstruction(id: string): Instruction | null {
  return instructions.find((item) => item.id === id) ?? null;
}

export function createInstruction(
  values: InstructionFormValues,
): Instruction {
  const instruction: Instruction = {
    id: `instr-${crypto.randomUUID().slice(0, 8)}`,
    title: values.title.trim(),
    number: values.number.trim() || "—",
    approvedAt: values.approvedAt.trim() || "—",
    responsible: values.responsible.trim() || "—",
    status: "draft",
  };

  instructions = [instruction, ...instructions];
  emit();
  return instruction;
}

export function updateInstruction(
  id: string,
  values: InstructionFormValues,
): Instruction | null {
  const index = instructions.findIndex((item) => item.id === id);
  if (index < 0) return null;

  const next: Instruction = {
    ...instructions[index]!,
    title: values.title.trim(),
    number: values.number.trim() || "—",
    approvedAt: values.approvedAt.trim() || "—",
    responsible: values.responsible.trim() || "—",
  };

  instructions = [
    ...instructions.slice(0, index),
    next,
    ...instructions.slice(index + 1),
  ];
  emit();
  return next;
}
