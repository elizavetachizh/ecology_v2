import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronRight,
  GalleryVerticalEnd,
  LogOut,
  X,
} from "lucide-react";
import {
  navigationGroups,
  type NavGroup,
} from "../../shared/config/navigation";
import { cn } from "../../shared/lib/cn";
import { useTenant } from "../../entities/tenant";
import { useLogout } from "../../features/auth/logout";

function isActivePath(pathname: string, to?: string) {
  if (!to) return false;
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function NavTreeItem({
  item,
  pathname,
  openIds,
  onToggle,
  onNavigate,
  collapsed,
}: {
  item: NavGroup;
  pathname: string;
  openIds: Set<string>;
  onToggle: (id: string) => void;
  onNavigate?: () => void;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const isOpen = openIds.has(item.id);
  const childActive = item.children?.some((child) =>
    isActivePath(pathname, child.to),
  );
  const selfActive = isActivePath(pathname, item.to);

  if (!hasChildren) {
    return (
      <Link
        to={item.to ?? "/"}
        title={collapsed ? item.title : undefined}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
          collapsed && "md:justify-center md:px-0",
          selfActive
            ? "bg-sidebar-accent font-medium text-sidebar-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className={cn("truncate", collapsed && "md:hidden")}>
          {item.title}
        </span>
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
          collapsed && "md:justify-center md:px-0",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          childActive && "font-medium text-sidebar-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span
          className={cn(
            "flex-1 truncate text-left",
            collapsed && "md:hidden",
          )}
        >
          {item.title}
        </span>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-90",
            collapsed && "md:hidden",
          )}
        />
      </button>

      {isOpen && item.children ? (
        <div
          className={cn(
            "relative ml-3.5 border-l border-sidebar-border py-0.5 pl-3.5",
            collapsed && "md:hidden",
          )}
        >
          {item.children.map((child) => {
            const active = isActivePath(pathname, child.to);
            return (
              <Link
                key={child.id}
                to={child.to}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
              >
                {child.title}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type AppSidebarProps = {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

type SidebarPanelProps = {
  collapsed: boolean;
  pathname: string;
  openIds: Set<string>;
  onToggle: (id: string) => void;
  onNavigate?: () => void;
  onClose?: () => void;
  className?: string;
};

function SidebarPanel({
  collapsed,
  pathname,
  openIds,
  onToggle,
  onNavigate,
  onClose,
  className,
}: SidebarPanelProps) {
  const { user } = useTenant();
  const { logout, isLoggingOut } = useLogout();
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b border-sidebar-border p-2">
        <button
          type="button"
          title={collapsed ? "Acme Inc" : undefined}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
            collapsed && "md:justify-center md:px-0",
            "hover:bg-sidebar-accent",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div
            className={cn(
              "min-w-0 flex-1 leading-tight",
              collapsed && "md:hidden",
            )}
          >
            <div className="truncate text-sm font-semibold">ПО Эколог</div>
            <div className="truncate text-xs text-muted-foreground">
              Экологический мониторинг
            </div>
          </div>
        </button>
        {onClose ? (
          <button
            type="button"
            aria-label="Закрыть меню"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navigationGroups.map((item) => (
          <NavTreeItem
            key={item.id}
            item={item}
            pathname={pathname}
            openIds={openIds}
            onToggle={onToggle}
            onNavigate={onNavigate}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          title={collapsed ? `Выйти: ${user.username}` : undefined}
          aria-label={`Выйти из учетной записи ${user.username}`}
          disabled={isLoggingOut}
          onClick={() => void logout()}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
            collapsed && "md:justify-center md:px-0",
            "hover:bg-sidebar-accent",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-medium text-white">
            {initials}
          </span>
          <span
            className={cn("min-w-0 flex-1", collapsed && "md:hidden")}
          >
            <span className="block truncate text-sm font-medium leading-tight">
              {user.username}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user.email ?? user.realm}
            </span>
          </span>
          <LogOut
            className={cn(
              "size-4 shrink-0 text-muted-foreground",
              collapsed && "md:hidden",
            )}
          />
        </button>
      </div>
    </aside>
  );
}

export default function AppSidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(["directories"]),
  );

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <SidebarPanel
        collapsed={collapsed}
        pathname={pathname}
        openIds={openIds}
        onToggle={toggle}
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 md:flex",
          collapsed ? "md:w-14" : "md:w-64",
        )}
      />

      {mobileOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Главное меню"
          className="fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            aria-label="Закрыть меню"
            className="absolute inset-0 bg-black/50"
            onClick={onMobileClose}
          />
          <SidebarPanel
            collapsed={false}
            pathname={pathname}
            openIds={openIds}
            onToggle={toggle}
            onNavigate={onMobileClose}
            onClose={onMobileClose}
            className="relative z-10 w-[min(20rem,calc(100vw-3rem))]"
          />
        </div>
      ) : null}
    </>
  );
}
