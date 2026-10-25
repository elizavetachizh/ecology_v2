import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PeriodLockInfo } from "./PeriodLockInfo";

const CLOSED_TEXT =
  "Операционный период закрыт 31.01.2026. Операции с этой датой и раньше нельзя создавать и изменять.";

function renderInfo() {
  return render(
    <div>
      <PeriodLockInfo lockDate="2026-01-31" />
      <button type="button">Снаружи</button>
    </div>,
  );
}

function infoButton() {
  return screen.getByRole("button", { name: "Операционный период" });
}

afterEach(cleanup);

describe("PeriodLockInfo", () => {
  it("shows the closed period text on hover and hides it after the pointer leaves", async () => {
    renderInfo();

    expect(screen.queryByText(CLOSED_TEXT)).not.toBeInTheDocument();

    fireEvent.pointerEnter(infoButton());

    expect(screen.getByText(CLOSED_TEXT)).toBeInTheDocument();

    fireEvent.pointerLeave(infoButton());

    await waitFor(() => {
      expect(screen.queryByText(CLOSED_TEXT)).not.toBeInTheDocument();
    });
  });

  it("stays open while the pointer moves from the button to the text", async () => {
    renderInfo();

    fireEvent.pointerEnter(infoButton());
    const content = document.querySelector('[data-slot="period-lock-info"]');
    expect(content).not.toBeNull();

    fireEvent.pointerLeave(infoButton());
    fireEvent.pointerEnter(content!);

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(screen.getByText(CLOSED_TEXT)).toBeInTheDocument();
  });

  it("pins the text on click and closes it on the next click", () => {
    renderInfo();

    fireEvent.click(infoButton());
    expect(screen.getByText(CLOSED_TEXT)).toBeInTheDocument();

    fireEvent.click(infoButton());
    expect(screen.queryByText(CLOSED_TEXT)).not.toBeInTheDocument();
  });

  it("keeps a clicked popover open after the pointer leaves until an outside click", async () => {
    renderInfo();

    fireEvent.click(infoButton());
    fireEvent.pointerLeave(infoButton());

    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(screen.getByText(CLOSED_TEXT)).toBeInTheDocument();

    const outside = screen.getByRole("button", { name: "Снаружи" });
    fireEvent.pointerDown(outside);
    fireEvent.click(outside);

    await waitFor(() => {
      expect(screen.queryByText(CLOSED_TEXT)).not.toBeInTheDocument();
    });
  });
});
