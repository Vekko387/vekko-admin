import type { ReactNode } from "react";

import { GuestOnlyGuard } from "@/features/auth/route-guards";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <GuestOnlyGuard>{children}</GuestOnlyGuard>;
}
