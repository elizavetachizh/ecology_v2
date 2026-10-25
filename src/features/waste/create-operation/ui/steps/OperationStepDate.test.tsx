import type { ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useFormContext } from "react-hook-form";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  createEmptyOperationFormValues,
  createOperationFormSchema,
  type OperationFormValues,
} from "../../model/operation-form.schema";
import { OperationStepDate } from "./OperationStepDate";

const LOCK_DATE = "2026-10-23";
const LOCKED_DATE_MESSAGE = "Дата попадает в закрытый период (по 23.10.2026)";

function OtherFieldErrors() {
  const {
    formState: { errors },
  } = useFormContext<OperationFormValues>();

  return (
    <>
      <span>{errors.unit_id?.message}</span>
      <span>{errors.waste_id?.message}</span>
    </>
  );
}

function renderDateStep(date: string, lockDate: string | null = LOCK_DATE) {
  function Wrapper({ children }: { children: ReactNode }) {
    const form = useForm<OperationFormValues>({
      resolver: zodResolver(createOperationFormSchema(lockDate)),
      defaultValues: {
        ...createEmptyOperationFormValues(),
        date,
      },
    });
    return (
      <FormProvider {...form}>
        {children}
        <OtherFieldErrors />
      </FormProvider>
    );
  }

  return render(<OperationStepDate pending={false} />, { wrapper: Wrapper });
}

function dateInput() {
  return screen.getByLabelText(/Дата проведения операции/);
}

afterEach(cleanup);

describe("OperationStepDate", () => {
  it("shows a locked prefilled date without validating the rest of the step", async () => {
    renderDateStep("2026-10-23");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      LOCKED_DATE_MESSAGE,
    );
    expect(screen.queryByText("Выберите место учёта")).not.toBeInTheDocument();
    expect(screen.queryByText("Выберите отход")).not.toBeInTheDocument();
  });

  it("stays quiet on open when the prefilled date is after the lock", async () => {
    renderDateStep("2026-10-24");

    await waitFor(() => expect(dateInput()).toHaveValue("2026-10-24"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("clears and shows the lock error as the date changes", async () => {
    renderDateStep("2026-10-23");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      LOCKED_DATE_MESSAGE,
    );

    fireEvent.change(dateInput(), { target: { value: "2026-10-24" } });

    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
    expect(screen.queryByText("Выберите место учёта")).not.toBeInTheDocument();

    fireEvent.change(dateInput(), { target: { value: "2026-10-20" } });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      LOCKED_DATE_MESSAGE,
    );
  });

  it("reports an empty date as soon as the field is cleared", async () => {
    renderDateStep("2026-10-24");

    fireEvent.change(dateInput(), { target: { value: "" } });

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Укажите дату операции",
    );
  });
});
