import { describe, expect, it } from "vitest";
import { makeNotification } from "../../../../entities/notifications/model/notification.fixture";
import { sortNotificationsBySeverity } from "./sort-notifications";

describe("sortNotificationsBySeverity", () => {
  it("orders critical, then warning, then info", () => {
    const info = makeNotification({ id: "info", severity: "info" });
    const warning = makeNotification({ id: "warning", severity: "warning" });
    const critical = makeNotification({
      id: "critical",
      severity: "critical",
    });

    expect(
      sortNotificationsBySeverity([info, warning, critical]).map(
        (item) => item.id,
      ),
    ).toEqual(["critical", "warning", "info"]);
  });

  it("keeps API order inside one severity", () => {
    const firstCritical = makeNotification({
      id: "critical-1",
      severity: "critical",
    });
    const secondCritical = makeNotification({
      id: "critical-2",
      severity: "critical",
    });
    const firstWarning = makeNotification({
      id: "warning-1",
      severity: "warning",
    });
    const secondWarning = makeNotification({
      id: "warning-2",
      severity: "warning",
    });
    const info = makeNotification({ id: "info", severity: "info" });

    expect(
      sortNotificationsBySeverity([
        secondWarning,
        info,
        firstCritical,
        firstWarning,
        secondCritical,
      ]).map((item) => item.id),
    ).toEqual(["critical-1", "critical-2", "warning-2", "warning-1", "info"]);
  });

  it("does not mutate the source list", () => {
    const items = [
      makeNotification({ id: "info", severity: "info" }),
      makeNotification({ id: "critical", severity: "critical" }),
    ];
    const snapshot = items.map((item) => item.id);

    sortNotificationsBySeverity(items);

    expect(items.map((item) => item.id)).toEqual(snapshot);
  });
});
