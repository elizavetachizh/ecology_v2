export function filenameFromContentDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) return fallback;

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/^["']|["']$/g, ""));
    } catch {
      return fallback;
    }
  }

  const fileNameMatch = header.match(/filename="?([^";]+)"?/i);
  return fileNameMatch?.[1]?.trim() || fallback;
}

export function pod9FallbackFileName(
  startDate: string,
  endDate: string,
  format: "xlsx" | "pdf" = "xlsx",
): string {
  return `pod-9_${startDate}_${endDate}.${format}`;
}
