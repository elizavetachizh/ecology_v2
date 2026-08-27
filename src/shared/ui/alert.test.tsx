import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "./alert";

afterEach(cleanup);

describe("Alert", () => {
  it("exposes title and description as an alert", () => {
    render(
      <Alert variant="error">
        <AlertTitle>Не удалось загрузить</AlertTitle>
        <AlertDescription>Проверьте сеть.</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Не удалось загрузить");
    expect(alert).toHaveTextContent("Проверьте сеть.");
  });

  it("can hide the status icon", () => {
    const { container, rerender } = render(
      <Alert variant="info">
        <AlertTitle>Подсказка</AlertTitle>
      </Alert>,
    );

    expect(container.querySelector("svg")).not.toBeNull();

    rerender(
      <Alert variant="info" showIcon={false}>
        <AlertTitle>Подсказка</AlertTitle>
      </Alert>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });
});
