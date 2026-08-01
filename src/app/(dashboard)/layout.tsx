import type { ReactNode } from "react";

import { AdminPortalGuard } from "@/features/auth/route-guards";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <AdminPortalGuard>{children}</AdminPortalGuard>;
}
