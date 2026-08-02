"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";
import { AuthErrorMessage, AuthLoading } from "@/features/auth/auth-feedback";

export function GuestOnlyGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [router, status]);

  if (status === "loading" || status === "authenticated") {
    return <AuthLoading />;
  }

  return children;
}

export function AdminPortalGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status, sessionError, retrySession, signOut } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, status]);

  if (status === "loading") {
    return <AuthLoading />;
  }

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/20 px-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Não foi possível validar sua sessão</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionError ? <AuthErrorMessage message={sessionError} /> : null}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void retrySession().catch(() => undefined)}>
                Tentar novamente
              </Button>
              <Button
                variant="outline"
                onClick={() => void signOut().catch(() => undefined)}
              >
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return <AuthLoading message="Redirecionando para o login..." />;
  }

  return children;
}
