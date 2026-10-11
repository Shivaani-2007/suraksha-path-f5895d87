import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_dash")({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
