import type { ReactNode } from "react";
import type { Unit } from "../../../../entities/waste/units";
import type { TerritoryLabels } from "../model/territory-from-parent";

export type UnitFormProps = {
  mode: "create" | "edit";
  unitId?: string;
  /** Предзаполнение родителя из ?parentId= */
  defaultParentId?: string;
  /** Предзаполнение флага ПОД-9 из ?isPod9= */
  defaultIsPod9?: boolean;
  activeTenantId: string | null;
  initial?: Unit | null;
  onSaved: (unit: Unit, meta: { close: boolean }) => void;
  onCancel: () => void;
  showNextStepCta?: boolean;
  /** Переопределяет eyebrow в PageContextBar (например breadcrumb иерархии). */
  eyebrow?: ReactNode;
  /** Доп. действия в PageContextBar (кнопки / badge). */
  actions?: ReactNode;
};

export type UnitFormFieldsProps = UnitFormProps & {
  defaultRegionId?: number;
  defaultDistrictId?: number;
  defaultTerritoryLabels?: TerritoryLabels;
};
