export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-xl space-y-2 py-12 text-center">
      <h1 className="text-2xl font-semibold">Недостаточно прав</h1>
      <p className="text-muted-foreground">
        У вашей учетной записи нет доступа к этому разделу.
      </p>
    </div>
  );
}
