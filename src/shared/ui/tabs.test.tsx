import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

afterEach(cleanup);

describe("Tabs", () => {
  it("shows the active panel and switches on trigger click", () => {
    render(
      <Tabs defaultValue="formed">
        <TabsList aria-label="Тип операции">
          <TabsTrigger value="formed">Образование</TabsTrigger>
          <TabsTrigger value="transfer">Передача</TabsTrigger>
        </TabsList>
        <TabsContent value="formed">Поля образования</TabsContent>
        <TabsContent value="transfer">Поля передачи</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText("Поля образования")).toBeVisible();
    expect(
      screen.queryByText("Поля передачи"),
    ).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("tab", { name: "Передача" }), {
      button: 0,
    });

    expect(screen.getByText("Поля передачи")).toBeVisible();
    expect(screen.queryByText("Поля образования")).not.toBeInTheDocument();
  });
});
