import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  FormField,
  FormSection,
} from "./field-label";
import { Input } from "./input";

afterEach(cleanup);

describe("FieldLabel", () => {
  it("associates the label with the control", () => {
    render(
      <>
        <FieldLabel htmlFor="name">Название</FieldLabel>
        <Input id="name" />
      </>,
    );

    expect(screen.getByLabelText("Название")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("marks a required field with an asterisk", () => {
    render(
      <>
        <FieldLabel htmlFor="name" required>
          Название
        </FieldLabel>
        <Input id="name" />
      </>,
    );

    expect(screen.getByText("*")).toHaveAttribute("aria-hidden");
    expect(screen.getByLabelText(/Название/)).toBeInTheDocument();
  });
});

describe("FieldError", () => {
  it("renders nothing without children", () => {
    const { container } = render(<FieldError />);
    expect(container).toBeEmptyDOMElement();
  });

  it("exposes the message as an alert", () => {
    render(<FieldError>Обязательное поле</FieldError>);
    expect(screen.getByRole("alert")).toHaveTextContent("Обязательное поле");
  });
});

describe("FormField", () => {
  it("composes label, description and error around the control", () => {
    render(
      <FormField
        htmlFor="code"
        label="Код"
        required
        description="Из классификатора"
        error="Укажите код"
      >
        <Input id="code" />
      </FormField>,
    );

    expect(screen.getByLabelText(/Код/)).toBeInTheDocument();
    expect(screen.getByText("Из классификатора")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Укажите код");
  });
});

describe("FormSection", () => {
  it("renders the title and optional description", () => {
    render(
      <FormSection title="Реквизиты" description="Основные поля">
        <FieldDescription>ИНН</FieldDescription>
      </FormSection>,
    );

    expect(
      screen.getByRole("heading", { name: "Реквизиты" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Основные поля")).toBeInTheDocument();
    expect(screen.getByText("ИНН")).toBeInTheDocument();
  });
});
