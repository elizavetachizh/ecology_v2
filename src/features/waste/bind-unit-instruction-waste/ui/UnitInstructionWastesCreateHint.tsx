export function UnitInstructionWastesCreateHint() {
  return (
    <section className="mx-auto max-w-4xl space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">
          Привязка отходов по инструкции
        </h2>
      </div>

      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
        <div className="mx-auto max-w-md space-y-1">
          <p className="text-sm font-medium text-foreground">
            Привязки станут доступны после создания
          </p>
          <p className="text-sm text-muted-foreground">
            После сохранения ПОД-9 вы сможете выбрать инструкцию и привязать
            отходы из справочника, указав источники образования.
          </p>
        </div>
      </div>
    </section>
  );
}
