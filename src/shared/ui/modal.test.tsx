import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "./modal";

afterEach(cleanup);

describe("Modal", () => {
  it("shows title, description and closes from the X button", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Создание операции</ModalTitle>
            <ModalDescription>Шаг 3 из 4</ModalDescription>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );

    expect(
      screen.getByRole("dialog", { name: "Создание операции" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Шаг 3 из 4")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("can hide the close button", () => {
    render(
      <Modal open onOpenChange={vi.fn()}>
        <ModalContent showClose={false}>
          <ModalHeader>
            <ModalTitle>Подтверждение</ModalTitle>
            <ModalDescription>Без крестика</ModalDescription>
          </ModalHeader>
        </ModalContent>
      </Modal>,
    );

    expect(
      screen.queryByRole("button", { name: "Закрыть" }),
    ).not.toBeInTheDocument();
  });
});
