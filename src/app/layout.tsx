import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "VEKKO Admin",
    template: "%s | VEKKO Admin",
  },
  description: "Painel interno de gestão e operação da VEKKO.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark h-full">
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
