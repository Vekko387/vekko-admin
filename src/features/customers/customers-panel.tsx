"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/services/api-error";

import type {
  Customer,
  CustomerList,
  UserStatus,
} from "./customer";
import { listCustomers, updateCustomerStatus } from "./customers-service";

function maskCpf(value: string | null): string {
  if (!value) return "Não informado";
  return `***.${value.slice(3, 6)}.${value.slice(6, 9)}-**`;
}

function formatPhone(value: string | null): string {
  if (!value) return "Não informado";
  if (value.length === 11) {
    return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
  }
  return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "Não foi possível carregar os clientes.";
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant={status === "ACTIVE" ? "secondary" : "destructive"}>
      {status === "ACTIVE" ? "Ativo" : "Bloqueado"}
    </Badge>
  );
}

function CustomerDetails({ customer }: { customer: Customer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{customer.profile.fullName ?? "Perfil incompleto"}</CardTitle>
        <CardDescription>{customer.email ?? "E-mail não informado"}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            CPF
          </p>
          <p className="mt-1 font-medium">{maskCpf(customer.profile.cpfNormalized)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Telefone
          </p>
          <p className="mt-1 font-medium">
            {formatPhone(customer.profile.phoneNormalized)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Perfil
          </p>
          <p className="mt-1 font-medium">
            {customer.profile.complete ? "Completo" : "Pendente"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Veículos ativos
          </p>
          <p className="mt-1 font-medium">{customer.activeVehicleCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomersPanel() {
  const [data, setData] = useState<CustomerList | null>(null);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "">("");
  const [profileFilter, setProfileFilter] = useState<"" | "complete" | "pending">(
    "",
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [pendingCustomerId, setPendingCustomerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    void listCustomers({
      page,
      ...(profileFilter
        ? { profileComplete: profileFilter === "complete" }
        : {}),
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    })
      .then((result) => {
        if (ignore) return;
        setData(result);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [page, profileFilter, search, status]);

  const selectedCustomer =
    data?.items.find(({ id }) => id === selectedCustomerId) ?? null;

  const handleStatusChange = async (customer: Customer) => {
    const nextStatus: UserStatus =
      customer.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const confirmed = window.confirm(
      nextStatus === "BLOCKED"
        ? "Bloquear este cliente? O acesso à API será interrompido imediatamente."
        : "Desbloquear este cliente e restaurar seu acesso?",
    );

    if (!confirmed) return;

    setPendingCustomerId(customer.id);
    setErrorMessage(null);

    try {
      const updated = await updateCustomerStatus(customer.id, nextStatus);
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === updated.id ? updated : item,
              ),
            }
          : current,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingCustomerId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Busque por nome, e-mail ou CPF.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(searchInput.trim());
            }}
          >
            <input
              aria-label="Buscar clientes"
              className="h-9 rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Nome, e-mail ou CPF"
              value={searchInput}
            />
            <select
              aria-label="Filtrar por status"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
              onChange={(event) => {
                setPage(1);
                setStatus(event.target.value as UserStatus | "");
              }}
              value={status}
            >
              <option value="">Todos os status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="BLOCKED">Bloqueados</option>
            </select>
            <select
              aria-label="Filtrar por perfil"
              className="h-9 rounded-lg border bg-background px-3 text-sm"
              onChange={(event) => {
                setPage(1);
                setProfileFilter(
                  event.target.value as "" | "complete" | "pending",
                );
              }}
              value={profileFilter}
            >
              <option value="">Todos os perfis</option>
              <option value="complete">Completos</option>
              <option value="pending">Pendentes</option>
            </select>
            <Button type="submit">Buscar</Button>
          </form>
        </CardContent>
      </Card>

      {errorMessage ? (
        <div
          aria-live="polite"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      ) : null}

      {selectedCustomer ? <CustomerDetails customer={selectedCustomer} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Clientes</CardTitle>
          <CardDescription>
            {data ? `${data.meta.total} cliente(s) encontrado(s).` : "Carregando..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Carregando clientes...
            </p>
          ) : data && data.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-4xl text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3">Cliente</th>
                    <th className="px-3 py-3">CPF</th>
                    <th className="px-3 py-3">Perfil</th>
                    <th className="px-3 py-3">Veículos</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.items.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-3 py-4">
                        <p className="font-medium">
                          {customer.profile.fullName ?? "Perfil incompleto"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {customer.email ?? "Sem e-mail"}
                        </p>
                      </td>
                      <td className="px-3 py-4 font-mono text-xs">
                        {maskCpf(customer.profile.cpfNormalized)}
                      </td>
                      <td className="px-3 py-4">
                        {customer.profile.complete ? "Completo" : "Pendente"}
                      </td>
                      <td className="px-3 py-4">{customer.activeVehicleCount}</td>
                      <td className="px-3 py-4">
                        <StatusBadge status={customer.status} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => setSelectedCustomerId(customer.id)}
                            size="sm"
                            variant="outline"
                          >
                            Detalhes
                          </Button>
                          <Button
                            disabled={pendingCustomerId === customer.id}
                            onClick={() => void handleStatusChange(customer)}
                            size="sm"
                            variant={
                              customer.status === "ACTIVE"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {pendingCustomerId === customer.id
                              ? "Salvando..."
                              : customer.status === "ACTIVE"
                                ? "Bloquear"
                                : "Desbloquear"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Nenhum cliente encontrado.
            </p>
          )}

          {data && data.meta.totalPages > 1 ? (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Página {data.meta.page} de {data.meta.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="outline"
                >
                  Anterior
                </Button>
                <Button
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="outline"
                >
                  Próxima
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
