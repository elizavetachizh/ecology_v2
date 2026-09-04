/** Заглушка на create waste: привязки доступны после сохранения карточки. */
export function WasteInstructionUnitsCreateHint() {
  return (
    <section className="mx-auto max-w-4xl space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold text-foreground">
          Привязка журналов ПОД-9 по инструкции
        </h2>
      </div>

      <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border px-4 text-center">
        <div className="mx-auto max-w-md space-y-1">
          <p className="text-sm font-medium text-foreground">
            Привязки станут доступны после создания
          </p>
          <p className="text-sm text-muted-foreground">
            После сохранения отхода выберите инструкцию, привяжите журналы
            ПОД-9, укажите источники образования и транспортную единицу.
          </p>
        </div>
      </div>
    </section>
  );
}
