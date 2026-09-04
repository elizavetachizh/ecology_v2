import { useEffect, useState } from "react";
import { Outlet } from "@tanstack/react-router";
import { TenantProvider } from "../providers/tenant/TenantProvider";
import { Toaster } from "../../shared/ui";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

export function AppLayout() {
  return (
    <>
      <TenantProvider>
        <AppShell />
      </TenantProvider>
      <Toaster />
    </>
  );
}

function AppShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mobileSidebarOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="flex h-full min-h-0 bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        {/* Padding on an inner wrapper: padding on the scroller lets sticky
            form headers leak fields into the gap under AppHeader. */}
        <main className="min-h-0 flex-1 overflow-auto">
          <div className="p-3 sm:p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
