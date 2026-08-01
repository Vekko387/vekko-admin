"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/features/auth/auth-context";
import { getAuthenticationErrorMessage } from "@/features/auth/auth-errors";
import { AuthErrorMessage } from "@/features/auth/auth-feedback";

const inputClassName =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, sessionError, clearSessionError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearErrors() {
    setErrorMessage(null);
    clearSessionError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearErrors();
    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      router.replace("/dashboard");
    } catch (error) {
      setErrorMessage(getAuthenticationErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleError = errorMessage ?? sessionError;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge className="mb-3" variant="outline">
            Acesso interno
          </Badge>
          <CardTitle className="text-2xl">VEKKO Admin</CardTitle>
          <CardDescription>
            Entre com uma conta interna previamente autorizada pela VEKKO.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {visibleError ? <AuthErrorMessage message={visibleError} /> : null}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                E-mail
              </label>
              <input
                autoComplete="email"
                className={inputClassName}
                disabled={isSubmitting}
                id="email"
                name="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearErrors();
                }}
                placeholder="admin@vekko.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium" htmlFor="password">
                  Senha
                </label>
                <Link
                  className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  href="/forgot-password"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <input
                autoComplete="current-password"
                className={inputClassName}
                disabled={isSubmitting}
                id="password"
                name="password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearErrors();
                }}
                required
                type="password"
                value={password}
              />
            </div>
          </CardContent>

          <CardFooter className="mt-5 justify-end">
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
