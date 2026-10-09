import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VehicleStatusBadge } from "./VehicleStatusBadge";

describe("VehicleStatusBadge", () => {
  it.each([
    ["active", "Активное"],
    ["inactive", "Неактивное"],
  ] as const)("renders label for %s", (status, label) => {
    render(<VehicleStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
