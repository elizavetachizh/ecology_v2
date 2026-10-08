import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationSeverityBadge } from "./NotificationSeverityBadge";

describe("NotificationSeverityBadge", () => {
  it.each([
    ["critical", "Превышение", "text-destructive"],
    ["warning", "Близко к лимиту", "text-warning-foreground"],
    ["info", "Информация", "text-info"],
  ] as const)("renders %s as %s", (severity, label, colorClass) => {
    render(<NotificationSeverityBadge severity={severity} />);
    expect(screen.getByText(label)).toHaveClass(colorClass);
  });
});
