import { useState } from "react";
import { Bell, ChevronsUpDown, PanelLeft } from "lucide-react";
import { ORGANIZATIONS } from "../../shared/config/organizations";
import { Button } from "../../shared/ui";
import { Select } from "../../shared/ui";

type AppHeaderProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileSidebar: () => void;
};

export default function AppHeader({
  sidebarCollapsed,
  onToggleSidebar,
  onOpenMobileSidebar,
}: AppHeaderProps) {
  const [organizationId, setOrganizationId] = useState(ORGANIZATIONS[0].id);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-2 sm:px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Открыть меню"
        onClick={onOpenMobileSidebar}
      >
        <PanelLeft />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="hidden md:inline-flex"
        aria-label={sidebarCollapsed ? "Развернуть меню" : "Свернуть меню"}
        aria-pressed={sidebarCollapsed}
        onClick={onToggleSidebar}
      >
        <PanelLeft />
      </Button>

      <div className="flex min-w-0 items-center gap-2">
        <Select
          aria-label="Организация"
          value={organizationId}
          onChange={(event) => setOrganizationId(event.target.value)}
          className="max-w-[12rem] sm:max-w-xs"
        >
          {ORGANIZATIONS.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </Select>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Уведомления"
        >
          <Bell />
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="h-auto gap-2 px-2 py-1.5"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-medium text-primary-foreground">
            ЭК
          </span>
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block truncate text-sm font-medium leading-tight text-foreground">
              Эколог
            </span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              ecolog@example.com
            </span>
          </span>
          <ChevronsUpDown className="hidden size-4 text-muted-foreground sm:block" />
        </Button>
      </div>
    </header>
  );
}
