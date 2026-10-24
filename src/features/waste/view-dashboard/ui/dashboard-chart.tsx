import type { ReactNode } from "react";

export function ChartFrame({ children }: { children: ReactNode }) {
  return (
    <section className="flex min-h-80 flex-col rounded-xl border border-border bg-card p-4">
      {children}
    </section>
  );
}

function ChartHeading({
  title,
  description,
  amount,
  note,
}: {
  title: string;
  description?: string;
  amount?: ReactNode;
  note?: string;
}) {
  return (
    <>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : null}
      {amount ? (
        <p className="text-2xl font-semibold tabular-nums tracking-tight">
          {amount}
        </p>
      ) : null}
      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </>
  );
}

export function ChartHeader({
  title,
  description,
  amount,
  note,
  actions,
}: {
  title: string;
  description?: string;
  amount?: ReactNode;
  note?: string;
  actions?: ReactNode;
}) {
  if (actions) {
    return (
      <div className="mb-3 flex flex-col items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <ChartHeading
            title={title}
            description={description}
            amount={amount}
            note={note}
          />
        </div>
        <div className="flex items-center gap-1.5">{actions}</div>
      </div>
    );
  }

  return (
    <div className="mb-3 min-w-0 space-y-1">
      <ChartHeading
        title={title}
        description={description}
        amount={amount}
        note={note}
      />
    </div>
  );
}

export function ChartEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
