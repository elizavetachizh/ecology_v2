import { Controller } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import {
  UOM_LABEL,
  useWastesOptions,
  type WasteBrief,
} from "../../../../entities/waste/wastes";
import { useWasteSourcesOptions } from "../../../../entities/waste/waste-sources";
import type {
  UnitInstructionWaste,
  UnitInstructionWasteScope,
} from "../../../../entities/waste/unit-instruction-waste";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  AsyncCombobox,
  Badge,
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
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

function wasteLabel(waste: WasteBrief) {
  return `${waste.waste_classifier.code} - ${waste.waste_classifier.name}`;
}

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

  const wastes = useWastesOptions({ tenantId, enabled: true });
  const sources = useWasteSourcesOptions({
    tenantId,
    enabled: true,
    limit: 50,
  });

  const selectedWasteId = form.watch("waste_id");
  const selectedWaste =
    wastes.options.find((item) => item.id === selectedWasteId) ??
    (initial?.waste_id === selectedWasteId
      ? ({
          id: initial.waste.id,
          waste_classifier: initial.waste.waste_classifier,
        } as WasteBrief)
      : null);

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

          <Field>
            <FieldLabel htmlFor="waste_id" required>
              Отход
            </FieldLabel>
            <Controller
              name="waste_id"
              control={control}
              render={({ field }) => (
                <AsyncCombobox
                  options={wastes.options.map((waste) => ({
                    value: waste.id,
                    label: wasteLabel(waste),
                  }))}
                  value={field.value}
                  selectedLabel={
                    selectedWaste
                      ? `${selectedWaste.waste_classifier.code} - ${selectedWaste.waste_classifier.name}`
                      : undefined
                  }
                  onValueChange={(id) => field.onChange(id ?? "")}
                  placeholder="Выберите отход из справочника"
                  searchPlaceholder="Поиск по коду или названию"
                  emptyMessage={
                    wastes.loading
                      ? "Загрузка…"
                      : "Начните вводить код или название"
                  }
                  search={wastes.search}
                  setSearch={wastes.setSearch}
                  className="w-full"
                  aria-label="Отход"
                />
              )}
            />
            <FieldDescription>
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
            </FieldDescription>
            <FieldError>{errors.waste_id?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="waste_source_ids">
              Источники образования
            </FieldLabel>
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
                  placeholder="Необязательно — выберите источники"
                  searchPlaceholder="Поиск источника"
                  emptyMessage={
                    sources.loading ? "Загрузка…" : "Источники не найдены"
                  }
                  aria-label="Источники образования"
                />
              )}
            />
            <FieldDescription>
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
            </FieldDescription>
            <FieldError>{errors.waste_source_ids?.message}</FieldError>
          </Field>

          <Field>
            <FieldLabel htmlFor="transport_unit" required>
              Транспортная единица
            </FieldLabel>
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
              {selectedWaste && <Badge>{UOM_LABEL[selectedWaste.uom]}</Badge>}
            </div>
            <FieldDescription>
              Число от 0 до 999999.999999, до 6 знаков после запятой. По
              умолчанию 0.
            </FieldDescription>
            <FieldError>{errors.transport_unit?.message}</FieldError>
          </Field>
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
