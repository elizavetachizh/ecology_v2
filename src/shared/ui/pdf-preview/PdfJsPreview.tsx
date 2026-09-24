import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Alert, AlertDescription } from "../alert";

GlobalWorkerOptions.workerSrc = pdfWorker;

const PAGE_SCALE = 1.35;
const PREVIEW_ERROR = "Не удалось отобразить PDF";

type PdfJsPreviewProps = {
  blob: Blob;
  label: string;
};

export function PdfJsPreview({ blob, label }: PdfJsPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const loadingTaskRef: {
      current: ReturnType<typeof getDocument> | null;
    } = { current: null };

    void (async () => {
      try {
        const data = new Uint8Array(await blob.arrayBuffer());
        if (cancelled) return;

        const loadingTask = getDocument({ data });
        loadingTaskRef.current = loadingTask;
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;
          const page = await pdf.getPage(pageNumber);
          if (cancelled) return;
          const viewport = page.getViewport({ scale: PAGE_SCALE });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "mx-auto mb-4 max-w-full bg-white shadow-sm";
          host.appendChild(canvas);
          await page.render({ canvas, viewport }).promise;
          if (cancelled) return;
        }

        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      void loadingTaskRef.current?.destroy();
      host.replaceChildren();
    };
  }, [blob]);

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      {status === "loading" ? (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 text-muted-foreground"
          role="status"
        >
          <LoaderCircle className="size-7 animate-spin text-primary" />
          <span className="text-sm">Готовим страницы PDF…</span>
        </div>
      ) : null}

      {status === "error" ? (
        <Alert variant="error">
          <AlertDescription>{PREVIEW_ERROR}</AlertDescription>
        </Alert>
      ) : null}

      <div
        ref={hostRef}
        className="min-h-0 flex-1 overflow-auto"
        role="document"
        aria-label={label}
      />
    </div>
  );
}
