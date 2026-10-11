import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell, ChevronsLeft, ChevronsRight, FileWarning, Home, Info, LayoutDashboard, Map, Menu, Navigation,
  Settings, ShieldCheck, Tent, UserCog, UserRound, History, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo, Pill } from "@/components/common";
import { useStore, type DemoRole } from "@/services/store";
import { useT, type TKey } from "@/services/i18n";
import { cn } from "@/lib/utils";

const NAV: { to: string; key: TKey; icon: typeof Home }[] = [
  { to: "/overview", key: "overview", icon: LayoutDashboard },
  { to: "/map", key: "map", icon: Map },
  { to: "/route", key: "route", icon: Navigation },
  { to: "/shelters", key: "shelters", icon: Tent },
  { to: "/report", key: "report", icon: FileWarning },
  { to: "/reports", key: "reports", icon: History },
  { to: "/alerts", key: "alerts", icon: Bell },
  { to: "/profile", key: "profile", icon: UserCog },
  { to: "/settings", key: "settings", icon: Settings },
  { to: "/about", key: "about", icon: Info },
];

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const t = useT();
  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {NAV.map(({ to, key, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              onClick={onNavigate}
              title={collapsed ? t(key) : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center px-0",
              )}
              activeProps={{ className: "bg-sidebar-primary !text-sidebar-primary-foreground hover:!bg-sidebar-primary" }}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden />
              <span className={collapsed ? "sr-only" : ""}>{t(key)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { settings, setSettings, alerts, role, setRole, profile } = useStore();
  const t = useT();
  const collapsed = settings.compactSidebar;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="flex min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-card focus:p-2">
        Skip to content
      </a>
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar p-3 transition-all md:flex", collapsed ? "w-[72px]" : "w-64")}>
        <Link to="/" className="mb-6 flex h-12 items-center px-2" aria-label="SURAKSHA PATH home">
          {collapsed ? <ShieldCheck className="mx-auto h-7 w-7 text-sidebar-primary" /> : <Logo light />}
        </Link>
        <div className="flex-1 overflow-y-auto">
          <NavList collapsed={collapsed} />
        </div>
        <button
          onClick={() => setSettings({ ...settings, compactSidebar: !collapsed })}
          className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="h-5 w-5" /> : <><ChevronsLeft className="h-5 w-5" /> Collapse</>}
        </button>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-4">
          <SheetTitle className="mb-4"><Logo light /></SheetTitle>
          <NavList onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[1000] flex h-16 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu />
          </Button>
          <Link to="/" className="md:hidden"><Logo className="text-sm" /></Link>
          <form
            role="search"
            className="relative hidden max-w-sm flex-1 sm:block"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/shelters", search: { q } });
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <label htmlFor="global-search" className="sr-only">{t("search")}</label>
            <input
              id="global-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm"
            />
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Pill tone="warning" className="hidden lg:inline-flex">{t("demo")}</Pill>
            {role === "admin" && <Pill tone="info">Demo admin</Pill>}
            <Button asChild variant="ghost" size="icon" aria-label={`Alerts, ${unread} unread`}>
              <Link to="/alerts" className="relative">
                <Bell />
                {unread > 0 && (
                  <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-danger-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Profile menu"><UserRound /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-[1100] w-56">
                <DropdownMenuLabel>{profile.name || "Guest (demo)"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Demo role (not real sign-in)</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={role} onValueChange={(v) => setRole(v as DemoRole)}>
                  <DropdownMenuRadioItem value="user">Community user</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="admin">Demo administrator</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/profile" })}>Accessibility profile</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-xs font-medium text-warning-foreground">
          Prototype with simulated data — not live emergency information. {t("official")}
        </div>
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
