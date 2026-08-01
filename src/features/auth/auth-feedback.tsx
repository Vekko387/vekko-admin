import { AlertCircle, LoaderCircle } from "lucide-react";

export function AuthLoading({ message = "Validando sua sessão..." }: { message?: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </main>
  );
}

export function AuthErrorMessage({ message }: { message: string }) {
  return (
    <div
      className="flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
      role="alert"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
