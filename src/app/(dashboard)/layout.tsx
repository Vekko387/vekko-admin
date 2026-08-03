import type { ReactNode } from "react";

import { AdminPortalGuard } from "@/features/auth/route-guards";
import { AdminNavigation } from "@/features/navigation/admin-navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminPortalGuard>
      <AdminNavigation />
      {children}
    </AdminPortalGuard>
  );
}
