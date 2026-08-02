"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-context";
import { isInternalRole, type InternalRole } from "@/features/auth/auth-user";

const ROLE_LABELS: Record<InternalRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  SUPORTE: "Suporte",
  FINANCEIRO: "Financeiro",
  COMERCIAL: "Comercial",
  OPERACOES: "Operações",
};

export function AdminIdentity() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) {
    return null;
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut();
    } catch {
      // O provider apresenta o erro e mantém a sessão em estado recuperável.
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:items-end">
      <div className="space-y-1 sm:text-right">
        <p className="text-sm font-medium">{user.email ?? "Conta sem e-mail"}</p>
        <div className="flex flex-wrap gap-1 sm:justify-end">
          {user.roles.filter(isInternalRole).map((role) => (
            <Badge key={role} variant="secondary">
              {ROLE_LABELS[role]}
            </Badge>
          ))}
        </div>
      </div>
      <Button
        disabled={isSigningOut}
        onClick={() => void handleSignOut()}
        size="sm"
        variant="outline"
      >
        <LogOut aria-hidden="true" />
        {isSigningOut ? "Saindo..." : "Sair"}
      </Button>
    </div>
  );
}
