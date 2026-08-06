"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listCustomers } from "@/features/customers/customers-service";
import { listAdminVehicles } from "@/features/vehicles/vehicles-service";

type Summary = {
  activeVehicles: number;
  blockedCustomers: number;
  customers: number;
  pendingProfiles: number;
};

export function OperationsSummary() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void Promise.all([
      listCustomers({ limit: 1 }),
      listCustomers({ limit: 1, status: "BLOCKED" }),
      listCustomers({ limit: 1, profileComplete: false }),
      listAdminVehicles({ limit: 1, status: "ACTIVE" }),
    ])
      .then(([customers, blocked, pending, vehicles]) => {
        if (active) {
          setSummary({
            activeVehicles: vehicles.meta.total,
            blockedCustomers: blocked.meta.total,
            customers: customers.meta.total,
            pendingProfiles: pending.meta.total,
          });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar os indicadores.",
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (errorMessage) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {errorMessage}
      </div>
    );
  }

  const metrics = [
    { label: "Clientes", value: summary?.customers },
    { label: "Perfis pendentes", value: summary?.pendingProfiles },
    { label: "Clientes bloqueados", value: summary?.blockedCustomers },
    { label: "Veículos ativos", value: summary?.activeVehicles },
  ];

  return (
    <section aria-label="Indicadores de clientes e veículos">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Resumo operacional</h2>
        <p className="text-sm text-muted-foreground">
          Indicadores do primeiro bloco da Fase 02.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} size="sm">
            <CardHeader>
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl">
                {metric.value ?? "—"}
              </CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
