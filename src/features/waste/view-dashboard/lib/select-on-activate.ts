export function selectOnActivate(
  event: { key: string; preventDefault: () => void },
  select: () => void,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    select();
  }
}
