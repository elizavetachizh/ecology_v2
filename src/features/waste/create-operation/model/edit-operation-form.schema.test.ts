import { describe, expect, it } from "vitest";
import { createEditOperationFormSchema } from "./edit-operation-form.schema";

const SOURCE_ID = "33333333-3333-4333-8333-333333333333";

const base = {
  date: "2026-03-01",
  amount: "10.5",
  waste_source_id: SOURCE_ID,
};

describe("createEditOperationFormSchema", () => {
  it("requires waste_source_id for formed", () => {
    const schema = createEditOperationFormSchema(true);
    expect(schema.safeParse({ ...base, waste_source_id: "" }).success).toBe(
      false,
    );
    expect(schema.parse(base)).toEqual(base);
  });

  it("allows empty waste_source_id when source is not required", () => {
    const schema = createEditOperationFormSchema(false);
    expect(schema.parse({ ...base, waste_source_id: "" })).toEqual({
      ...base,
      waste_source_id: "",
    });
  });

  it("rejects invalid date and non-positive amount", () => {
    const schema = createEditOperationFormSchema(false);
    expect(schema.safeParse({ ...base, date: "01.03.2026" }).success).toBe(
      false,
    );
    expect(schema.safeParse({ ...base, amount: "0" }).success).toBe(false);
  });

  it("accepts any date when the period is open", () => {
    expect(createEditOperationFormSchema(false).parse(base)).toEqual(base);
    expect(createEditOperationFormSchema(false, null).parse(base)).toEqual(
      base,
    );
  });

  it("rejects a date on or before the lock date and accepts a later one", () => {
    const schema = createEditOperationFormSchema(false, "2026-03-01");
    const onLock = schema.safeParse(base);
    expect(onLock.success).toBe(false);
    if (!onLock.success) {
      expect(onLock.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            path: ["date"],
            message: "Дата попадает в закрытый период (по 01.03.2026)",
          }),
        ]),
      );
    }
    expect(schema.safeParse({ ...base, date: "2026-02-28" }).success).toBe(
      false,
    );
    expect(schema.parse({ ...base, date: "2026-03-02" })).toEqual({
      ...base,
      date: "2026-03-02",
    });
  });
});
