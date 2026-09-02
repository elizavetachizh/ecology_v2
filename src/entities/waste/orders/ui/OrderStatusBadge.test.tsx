import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderStatusBadge } from "./OrderStatusBadge";

describe("OrderStatusBadge", () => {
  it.each([
    ["active", "Действует"],
    ["inactive", "Не действует"],
  ] as const)("renders label for %s", (status, label) => {
    render(<OrderStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
