import type { Instruction } from "../model/instructions.types";
import { Tabs, TabsList, TabsTrigger } from "../../../../shared/ui";
import { InstructionTabLabel } from "./InstructionTabLabel";

type InstructionTabsProps = {
  instructions: Instruction[];
  value: string;
  onValueChange: (instructionId: string) => void;
};

export function InstructionTabs({
  instructions,
  value,
  onValueChange,
}: InstructionTabsProps) {
  return (
    <Tabs value={value} onValueChange={(nextId) => onValueChange(nextId || "")}>
      <TabsList
        aria-label="Инструкции"
        className="max-w-full justify-start overflow-x-auto"
      >
        {instructions.map((item) => (
          <TabsTrigger
            key={item.id}
            value={item.id}
            className="max-w-80 shrink-0"
          >
            <InstructionTabLabel instruction={item} />
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
