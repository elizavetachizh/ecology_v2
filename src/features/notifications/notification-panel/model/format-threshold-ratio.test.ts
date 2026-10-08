import { describe, expect, it } from "vitest";
import { transportUnitThresholdPayloadFixture } from "../../../../entities/notifications/model/notification.fixture";
import { formatThresholdFill } from "./format-threshold-ratio";

describe("formatThresholdFill", () => {
  it("formats 85% and the payload amounts in ru-RU", () => {
    expect(formatThresholdFill(transportUnitThresholdPayloadFixture)).toEqual({
      percent: 85,
      percentLabel: "85%",
      barPercent: 85,
      amountLabel: "8,5",
      transportUnitLabel: "10",
    });
  });

  it("formats 124% with a full bar when the ratio is above 1", () => {
    expect(
      formatThresholdFill({
        ...transportUnitThresholdPayloadFixture,
        amount: "12.400000",
        ratio: "1.24",
      }),
    ).toEqual({
      percent: 124,
      percentLabel: "124%",
      barPercent: 100,
      amountLabel: "12,4",
      transportUnitLabel: "10",
    });
  });

  it("returns null when the ratio is missing or not a number", () => {
    expect(
      formatThresholdFill({
        ...transportUnitThresholdPayloadFixture,
        ratio: "",
      }),
    ).toBeNull();
    expect(
      formatThresholdFill({
        ...transportUnitThresholdPayloadFixture,
        ratio: "нет",
      }),
    ).toBeNull();
  });
});
