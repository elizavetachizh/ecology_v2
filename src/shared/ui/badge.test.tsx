import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Badge } from "./badge";

afterEach(cleanup);

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge>Действует</Badge>);
    expect(screen.getByText("Действует")).toBeInTheDocument();
  });
});
