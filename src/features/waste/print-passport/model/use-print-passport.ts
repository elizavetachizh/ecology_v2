import { useMutation } from "@tanstack/react-query";
import {
  downloadPassport,
  type PassportFileFormat,
} from "../../../../entities/waste/passports";
import { toast } from "../../../../shared/ui";
import { passportDownloadErrorMessage } from "./passport-download-error";
import { downloadBlob } from "../../../../shared/lib/download-blob.ts";

export function usePrintPassport() {
  const mutation = useMutation({
    mutationFn: (vars: {
      id: string;
      number: string;
      format: PassportFileFormat;
    }) =>
      downloadPassport(vars.id, {
        format: vars.format,
        number: vars.number,
      }),
    onSuccess: (file) => {
      downloadBlob(file.blob, file.fileName);
    },
    onError: (error) => {
      toast.error(passportDownloadErrorMessage(error));
    },
  });

  return {
    print: (id: string, number: string, format: PassportFileFormat) =>
      mutation.mutate({ id, number, format }),
    pending: mutation.isPending,
  };
}
