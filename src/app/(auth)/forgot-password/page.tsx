"use client";

import { FirebaseError } from "firebase/app";
import Link from "next/link";
import { useState, type FormEvent } from "react";

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

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wasSent, setWasSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await sendPasswordReset(email.trim());
      setWasSent(true);
    } catch (error) {
      if (error instanceof FirebaseError && error.code === "auth/user-not-found") {
        setWasSent(true);
      } else {
        setErrorMessage(getAuthenticationErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Recuperar acesso</CardTitle>
          <CardDescription>
            Informe o e-mail da conta interna cadastrada no Firebase.
          </CardDescription>
        </CardHeader>

        {wasSent ? (
          <>
            <CardContent>
              <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-6">
                Se houver uma conta válida para este e-mail, o Firebase enviará as
                instruções de recuperação.
              </p>
            </CardContent>
            <CardFooter className="mt-5 justify-end">
              <Button asChild>
                <Link href="/login">Voltar ao login</Link>
              </Button>
            </CardFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage ? <AuthErrorMessage message={errorMessage} /> : null}
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="reset-email">
                  E-mail
                </label>
                <input
                  autoComplete="email"
                  className={inputClassName}
                  disabled={isSubmitting}
                  id="reset-email"
                  name="email"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMessage(null);
                  }}
                  required
                  type="email"
                  value={email}
                />
              </div>
            </CardContent>
            <CardFooter className="mt-5 justify-between">
              <Button asChild variant="ghost">
                <Link href="/login">Cancelar</Link>
              </Button>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? "Enviando..." : "Enviar instruções"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </main>
  );
}
