import type { ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  PageContextBar,
} from "../../../../shared/ui";
import { getUnitFormHeaderCopy } from "../model/unit-form-header-copy";

type UnitFormHeaderProps = {
  mode: "create" | "edit";
  defaultIsPod9?: boolean;
  isPod9: boolean;
  unitName?: string | null;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  successMessage?: string | null;
  error?: string | null;
};

export function UnitFormHeader({
  mode,
  defaultIsPod9,
  isPod9,
  unitName,
  eyebrow = "Справочники / Структурные единицы",
  actions,
  successMessage,
  error,
}: UnitFormHeaderProps) {
  const { title, description } = getUnitFormHeaderCopy({
    mode,
    defaultIsPod9,
    isPod9,
    unitName,
  });

  return (
    <>
      {successMessage ? (
        <Alert variant="success">
          <AlertTitle>Сохранено</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      ) : null}

      <PageContextBar
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          actions !== undefined ? (
            actions
          ) : isPod9 ? (
            <Badge variant="info">ПОД-9</Badge>
          ) : undefined
        }
      />

      {error ? (
        <Alert variant="error">
          <AlertTitle>Не удалось сохранить</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}
