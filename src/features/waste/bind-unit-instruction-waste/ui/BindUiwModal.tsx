import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { UOM_LABEL, WasteSelect } from "../../../../entities/waste/wastes";
import { useWasteSourcesOptions } from "../../../../entities/waste/waste-sources";
import type {
  UnitInstructionWaste,
  UnitInstructionWasteScope,
} from "../../../../entities/waste/unit-instruction-waste";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  FormField,
  Input,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  MultipleCombobox,
} from "../../../../shared/ui";
import { useBindUiwForm } from "../model/use-bind-uiw-form";
import { routes } from "../../../../shared/config/routes";

type BindUiwModalProps = {
  open: boolean;
  mode: "create" | "edit";
  tenantId: string | null;
  scope: UnitInstructionWasteScope;
  initial?: UnitInstructionWaste | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (binding: UnitInstructionWaste) => void;
};

export function BindUiwModal({
  open,
  mode,
  tenantId,
  scope,
  initial,
  onOpenChange,
  onSaved,
}: BindUiwModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {/* Remount on open → fresh defaultValues / error без useEffect reset. */}
      {open ? (
        <BindUiwModalForm
          key={`${mode}-${initial?.id ?? "new"}`}
          mode={mode}
          tenantId={tenantId}
          scope={scope}
          initial={initial}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      ) : null}
    </Modal>
  );
}

type BindUiwModalFormProps = Omit<BindUiwModalProps, "open">;

function BindUiwModalForm({
  mode,
  tenantId,
  scope,
  initial,
  onOpenChange,
  onSaved,
}: BindUiwModalFormProps) {
  const { form, error, pending, onSubmit } = useBindUiwForm({
    mode,
    scope,
    initial,
    onSaved,
  });

  const {
    control,
    register,
    formState: { errors },
  } = form;

  const sources = useWasteSourcesOptions({
    tenantId,
    enabled: true,
    limit: 50,
  });

  const selectedWasteId = form.watch("waste_id");

  return (
    <ModalContent className="max-w-lg">
      <form className="min-w-0" onSubmit={form.handleSubmit(onSubmit)}>
        <ModalHeader>
          <ModalTitle>
            {mode === "create" ? "Привязать отход" : "Изменить привязку отхода"}
          </ModalTitle>
          <ModalDescription>
            Выберите существующий отход из справочника организации. Новый отход
            создаётся только в справочнике отходов.
          </ModalDescription>
        </ModalHeader>

        <div className="grid min-w-0 gap-4 py-2">
          {error ? (
            <Alert variant="error">
              <AlertTitle>Не удалось сохранить</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <FormField
            htmlFor="waste_id"
            label="Отход"
            required
            error={errors.waste_id?.message}
            description={
              <>
                Нет нужного отхода?{" "}
                <Link
                  to={routes.directories.wastes.new}
                  search={tenantId ? { tenant: tenantId } : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Создать в справочнике
                </Link>
              </>
            }
          >
            <Controller
              name="waste_id"
              control={control}
              render={({ field }) => (
                <WasteSelect
                  tenantId={tenantId}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </FormField>

          <FormField
            htmlFor="waste_source_ids"
            label="Источники образования"
            error={errors.waste_source_ids?.message}
            description={
              <>
                Можно выбрать несколько. Нет нужного источника?{" "}
                <Link
                  to={routes.directories.wasteSources.list}
                  search={tenantId ? { tenant: tenantId } : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Создать в справочнике
                </Link>
              </>
            }
          >
            <Controller
              name="waste_source_ids"
              control={control}
              render={({ field }) => (
                <MultipleCombobox
                  options={sources.options.map((source) => ({
                    value: source.id,
                    label: source.name,
                  }))}
                  value={field.value}
                  onValueChange={field.onChange}
                  search={sources.search}
                  setSearch={sources.setSearch}
                  onRefresh={() => {
                    void sources.refetch();
                  }}
                  refreshing={sources.refreshing}
                  placeholder="Необязательно — выберите источники"
                  searchPlaceholder="Поиск источника"
                  emptyMessage={
                    sources.loading ? "Загрузка…" : "Источники не найдены"
                  }
                  aria-label="Источники образования"
                />
              )}
            />
          </FormField>

          <FormField
            htmlFor="transport_unit"
            label="Транспортная единица"
            required
            error={errors.transport_unit?.message}
            description="Число от 0 до 999999.999999, до 6 знаков после запятой. По умолчанию 0."
          >
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Input
                  id="transport_unit"
                  inputMode="decimal"
                  placeholder="0"
                  aria-invalid={Boolean(errors.transport_unit)}
                  {...register("transport_unit")}
                />
              </div>
              {initial?.waste_id === selectedWasteId && (
                <Badge>{UOM_LABEL[initial.waste.uom]}</Badge>
              )}
            </div>
          </FormField>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Отмена
          </Button>
          <Button type="submit" disabled={pending}>
            {pending
              ? "Сохранение…"
              : mode === "create"
                ? "Привязать"
                : "Сохранить"}
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  );
}
