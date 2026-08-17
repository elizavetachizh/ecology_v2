import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WasteSourcesCell } from "./WasteSourcesCell";

describe("WasteSourcesCell", () => {
  it("shows empty placeholder when there are no sources", () => {
    render(<WasteSourcesCell sources={[]} />);
    expect(screen.getByText("Не указаны")).toBeInTheDocument();
  });

  it("renders a badge per source name", () => {
    render(
      <WasteSourcesCell
        sources={[
          { id: "1", name: "Цех №1" },
          { id: "2", name: "Цех №2" },
        ]}
      />,
    );

    expect(screen.getByText("Цех №1")).toBeInTheDocument();
    expect(screen.getByText("Цех №2")).toBeInTheDocument();
  });
});
