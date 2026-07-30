import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronRight, ChevronsUpDown, GalleryVerticalEnd } from "lucide-react";
import {
  navigationGroups,
  type NavGroup,
} from "../../shared/config/navigation";
import { cn } from "../../shared/lib/cn";

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
  collapsed,
}: {
  item: NavGroup;
  pathname: string;
  openIds: Set<string>;
  onToggle: (id: string) => void;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const isOpen = !collapsed && openIds.has(item.id);
  const childActive = item.children?.some((child) =>
    isActivePath(pathname, child.to),
  );
  const selfActive = isActivePath(pathname, item.to);

  if (!hasChildren) {
    return (
      <Link
        to={item.to ?? "/"}
        title={collapsed ? item.title : undefined}
        className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
          collapsed && "justify-center px-0",
          selfActive
            ? "bg-sidebar-accent font-medium text-sidebar-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.title}</span>}
      </Link>
    );
  }

  if (collapsed) {
    return (
      <button
        type="button"
        title={item.title}
        className={cn(
          "flex w-full items-center justify-center rounded-md py-1.5 text-sm",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          childActive && "font-medium text-sidebar-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          childActive && "font-medium text-sidebar-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.title}</span>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen && "rotate-90",
          )}
        />
      </button>

      {isOpen && item.children ? (
        <div className="relative ml-3.5 border-l border-sidebar-border py-0.5 pl-3.5">
          {item.children.map((child) => {
            const active = isActivePath(pathname, child.to);
            return (
              <Link
                key={child.id}
                to={child.to}
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
};

export default function AppSidebar({ collapsed }: AppSidebarProps) {
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
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-14" : "w-64",
      )}
    >
      <div className="border-b border-sidebar-border p-2">
        <button
          type="button"
          title={collapsed ? "Acme Inc" : undefined}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
            collapsed && "justify-center px-0",
            "hover:bg-sidebar-accent",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground text-background">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-sm font-semibold">ПО Эколог</div>
              <div className="truncate text-xs text-muted-foreground">
                Экологический мониторинг
              </div>
            </div>
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navigationGroups.map((item) => (
          <NavTreeItem
            key={item.id}
            item={item}
            pathname={pathname}
            openIds={openIds}
            onToggle={toggle}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          title={collapsed ? "shadcn" : undefined}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
            collapsed && "justify-center px-0",
            "hover:bg-sidebar-accent",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xs font-medium text-white">
            sh
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium leading-tight">
                  shadcn
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  m@example.com
                </span>
              </span>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
