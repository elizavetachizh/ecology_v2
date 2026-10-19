import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  makeNotification,
  notificationFixture,
} from "../../../../entities/notifications/model/notification.fixture";
import { formatDateTime } from "../../../../shared/lib/format-date";
import { routes } from "../../../../shared/config/routes";
import { NotificationItem } from "./NotificationItem";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    search,
    params,
  }: {
    children: ReactNode;
    to: string;
    search?: unknown;
    params?: unknown;
  }) => (
    <a
      href={to}
      data-search={search ? JSON.stringify(search) : ""}
      data-params={params ? JSON.stringify(params) : ""}
    >
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe("NotificationItem", () => {
  it("shows the threshold card with an 85% bar and both links", () => {
    render(<NotificationItem notification={notificationFixture} />);

    expect(screen.getByText("Близко к лимиту")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: notificationFixture.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(notificationFixture.body ?? ""),
    ).toBeInTheDocument();
    expect(
      screen.getByText(formatDateTime(notificationFixture.detected_at)),
    ).toBeInTheDocument();
    expect(screen.getByText("8,5 из 10")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveClass("border-l-warning");
    expect(screen.getByText("85%")).toHaveClass("text-warning-foreground");

    const bar = screen.getByRole("progressbar", { name: "Заполненность 85%" });
    expect(bar).toHaveAttribute("aria-valuenow", "85");
    expect(bar.firstElementChild).toHaveClass("bg-warning");
    expect(bar.firstElementChild).toHaveStyle({ width: "85%" });

    const operations = screen.getByRole("link", {
      name: "Операции по этой паре",
    });
    expect(operations).toHaveAttribute("href", routes.operations.list);
    expect(operations).toHaveAttribute(
      "data-search",
      JSON.stringify({ unit_id: "unit-1", waste_id: "waste-1" }),
    );

    const unit = screen.getByRole("link", { name: "Место учёта" });
    expect(unit).toHaveAttribute("href", routes.directories.units.detail);
    expect(unit).toHaveAttribute(
      "data-params",
      JSON.stringify({ unitId: "unit-1" }),
    );
    expect(unit).toHaveAttribute(
      "data-search",
      JSON.stringify({ instructionId: "instruction-1" }),
    );
  });

  it("fills the bar and shows a percent above 100 when the ratio is above 1", () => {
    render(
      <NotificationItem
        notification={makeNotification({
          severity: "critical",
          payload: {
            ...notificationFixture.payload,
            amount: "12.400000",
            ratio: "1.24",
          },
        })}
      />,
    );

    expect(screen.getByRole("article")).toHaveClass("border-l-destructive");
    expect(screen.getByText("Превышение")).toBeInTheDocument();
    expect(screen.getByText("12,4 из 10")).toBeInTheDocument();
    expect(screen.getByText("124%")).toHaveClass("text-destructive");
    const bar = screen.getByRole("progressbar", {
      name: "Заполненность 124%",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar.firstElementChild).toHaveClass("bg-destructive");
    expect(bar.firstElementChild).toHaveStyle({ width: "100%" });
  });

  it("shows title and body without links or a bar for an unknown code", () => {
    render(
      <NotificationItem
        notification={makeNotification({
          code: "admin_notice",
          severity: "info",
          title: "Плановые работы",
          body: "Сервис будет недоступен",
          payload: { ...notificationFixture.payload },
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Плановые работы" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Сервис будет недоступен")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveClass("border-l-info");
    expect(screen.getByText("Информация")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
