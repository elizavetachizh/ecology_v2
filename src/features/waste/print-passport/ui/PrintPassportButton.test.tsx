import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrintPassportButton } from "./PrintPassportButton";
import { usePrintPassport } from "../model/use-print-passport";

vi.mock("../model/use-print-passport", () => ({
  usePrintPassport: vi.fn(),
}));

const usePrintPassportMock = vi.mocked(usePrintPassport);

function openPrintMenu() {
  const trigger = screen.getByRole("button", { name: /Печать/ });
  fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
  fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
}

describe("PrintPassportButton", () => {
  afterEach(cleanup);

  it("offers Word and PDF and prints the chosen format", () => {
    const print = vi.fn();
    usePrintPassportMock.mockReturnValue({ print, pending: false });

    render(<PrintPassportButton passportId="p-1" number="СП-001" />);

    openPrintMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Word" }));
    expect(print).toHaveBeenCalledWith("p-1", "СП-001", "docx");

    openPrintMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "PDF" }));
    expect(print).toHaveBeenCalledWith("p-1", "СП-001", "pdf");
  });
});
