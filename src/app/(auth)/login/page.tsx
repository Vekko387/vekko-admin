import Link from "next/link";

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

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/20 px-6 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Badge className="mb-3" variant="outline">
            Acesso interno
          </Badge>
          <CardTitle className="text-2xl">VEKKO Admin</CardTitle>
          <CardDescription>
            A autenticação será conectada ao Firebase na etapa de identidade e
            autorização.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          A estrutura da rota está pronta. Nenhuma credencial local ou acesso
          fictício foi criado.
        </CardContent>
        <CardFooter className="justify-between">
          <Button asChild variant="ghost">
            <Link href="/">Voltar</Link>
          </Button>
          <Button disabled>Entrar</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
