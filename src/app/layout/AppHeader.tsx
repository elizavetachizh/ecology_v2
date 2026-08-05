import { Bell, LogOut, PanelLeft } from "lucide-react";
import { useTenant } from "../providers/tenant/tenant-context";
import { useLogout } from "../../features/auth/logout";
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
  const { user, flatTenants, activeTenantId, selectTenant } = useTenant();
  const { logout, isLoggingOut } = useLogout();
  const initials = user.username.slice(0, 2).toUpperCase();

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
          aria-label="Активная организация"
          value={activeTenantId ?? ""}
          onChange={(event) => void selectTenant(event.target.value)}
          disabled={flatTenants.length === 0}
          className="max-w-[12rem] sm:max-w-xs"
        >
          <option value="" disabled>
            {flatTenants.length === 0
              ? "Нет доступных организаций"
              : "Выберите организацию"}
          </option>
          {flatTenants.map((tenant) => (
            <option key={tenant.id} value={tenant.id}>
              {tenant.short || tenant.name}
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

        <div className="flex items-center">
          <div className="flex h-auto gap-2 px-2 py-1.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-medium text-primary-foreground">
            {initials}
          </span>
          <span className="hidden min-w-0 text-left sm:block">
            <span className="block truncate text-sm font-medium leading-tight text-foreground">
              {user.username}
            </span>
            <span className="block truncate text-xs font-normal text-muted-foreground">
              {user.email ?? user.realm}
            </span>
          </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Выйти"
            title="Выйти"
            disabled={isLoggingOut}
            onClick={() => void logout()}
          >
            <LogOut />
          </Button>
        </div>
      </div>
    </header>
  );
}
