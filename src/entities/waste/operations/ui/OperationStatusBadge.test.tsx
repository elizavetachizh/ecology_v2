import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperationStatusBadge } from "./OperationStatusBadge";

describe("OperationStatusBadge", () => {
  it.each([
    ["confirmed", "Подтверждено"],
    ["pending", "Ожидает обработки"],
    ["confirmation_required", "Требует подтверждения"],
    ["declined", "Отклонено"],
  ] as const)("renders label for %s", (status, label) => {
    render(<OperationStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
