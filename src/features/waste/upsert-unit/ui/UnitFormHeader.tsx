import type { ReactNode } from "react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  DirectoryBreadcrumb,
  PageContextBar,
} from "../../../../shared/ui";
import { getUnitFormHeaderCopy } from "../model/unit-form-header-copy";
import { routes } from "../../../../shared/config/routes";

type UnitFormHeaderProps = {
  mode: "create" | "edit";
  defaultIsPod9?: boolean;
  isPod9: boolean;
  unitName?: string | null;
  eyebrow?: ReactNode;
  actions?: ReactNode;
  error?: string | null;
};

export function UnitFormHeader({
  mode,
  defaultIsPod9,
  isPod9,
  unitName,
  eyebrow = (
    <DirectoryBreadcrumb
      directoryLabel="Структура организации"
      directoryTo={routes.directories.units.list}
    />
  ),
  actions,
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
