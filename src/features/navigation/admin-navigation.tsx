"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const NAVIGATION = [
  { href: "/dashboard", label: "Operação" },
  { href: "/clientes", label: "Clientes" },
  { href: "/veiculos", label: "Veículos" },
  { href: "/planos", label: "Planos" },
  { href: "/parceiros", label: "Parceiros" },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground">
            VEKKO
          </p>
          <p className="font-semibold">Painel administrativo</p>
        </div>
        <nav aria-label="Navegação administrativa" className="flex flex-wrap gap-2">
          {NAVIGATION.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
