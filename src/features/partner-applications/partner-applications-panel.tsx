"use client";

import {
  Building2,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
import { canReviewPartnerApplications } from "@/features/auth/auth-user";
import type { PartnerApplication } from "@/features/partner-applications/partner-application";
import {
  approvePartnerApplication,
  listPendingPartnerApplications,
} from "@/features/partner-applications/partner-applications-service";
import { ApiError } from "@/services/api-error";

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

type LoadState = "loading" | "ready" | "error";

function formatDateTime(value: string): string {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? "Data indisponível" : DATE_TIME_FORMAT.format(date);
}

function formatCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length !== 14) {
    return value;
  }

  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

function getListErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) {
      return "Sua conta não tem permissão para consultar solicitações.";
    }

    return "Não foi possível carregar as solicitações agora.";
  }

  return "A API retornou uma resposta inesperada. Tente novamente.";
}

function ApplicationCard({
  application,
  isDisabled,
  isApproving,
  onApprove,
  referenceTime,
}: {
  application: PartnerApplication;
  isDisabled: boolean;
  isApproving: boolean;
  onApprove: (application: PartnerApplication) => void;
  referenceTime: number;
}) {
  const deadline = new Date(application.reviewDeadlineAt);
  const isOverdue =
    referenceTime > 0 &&
    !Number.isNaN(deadline.getTime()) &&
    deadline.getTime() < referenceTime;
  const fullAddress = [
    `${application.street}, ${application.addressNumber}`,
    application.addressComplement,
    application.neighborhood,
    `${application.city}/${application.state}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div className="space-y-1">
            <CardTitle className="text-lg">{application.tradeName}</CardTitle>
            <CardDescription>{application.legalName}</CardDescription>
          </div>
          <Badge variant={isOverdue ? "destructive" : "outline"}>
            <Clock3 aria-hidden="true" />
            {isOverdue ? "Prazo vencido" : "Em análise"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">CNPJ</dt>
              <dd>{formatCnpj(application.cnpj)}</dd>
            </div>
          </div>
          <div className="flex gap-2">
            <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Responsável</dt>
              <dd>{application.responsibleName}</dd>
            </div>
          </div>
          <div className="flex gap-2">
            <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">E-mail</dt>
              <dd className="break-all">{application.contactEmail}</dd>
            </div>
          </div>
          <div className="flex gap-2">
            <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Telefone</dt>
              <dd>{application.contactPhone}</dd>
            </div>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div>
              <dt className="text-xs text-muted-foreground">Endereço</dt>
              <dd>{fullAddress}</dd>
            </div>
          </div>
        </dl>

        <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Categoria</p>
            <p className="mt-1 text-sm">{application.businessCategory}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Serviços informados</p>
            <p className="mt-1 text-sm leading-6">{application.serviceDescription}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span>Enviada em {formatDateTime(application.submittedAt)}</span>
          <span>Prazo até {formatDateTime(application.reviewDeadlineAt)}</span>
        </div>
      </CardContent>

      <CardFooter className="justify-end">
        <Button
          disabled={isDisabled}
          onClick={() => onApprove(application)}
          type="button"
        >
          {isApproving ? (
            <LoaderCircle className="animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 aria-hidden="true" />
          )}
          {isApproving ? "Aprovando..." : "Aprovar parceiro"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PartnerApplicationsPanel() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<PartnerApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [loadedAt, setLoadedAt] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const canReview = user ? canReviewPartnerApplications(user.roles) : false;

  const loadApplications = useCallback(async () => {
    try {
      const response = await listPendingPartnerApplications(page);

      if (response.items.length === 0 && response.meta.total > 0 && page > 1) {
        setPage((currentPage) => currentPage - 1);
        return;
      }

      setItems(response.items);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
      setLoadedAt(Date.now());
      setLoadState("ready");
    } catch (error) {
      setErrorMessage(getListErrorMessage(error));
      setLoadState("error");
    }
  }, [page]);

  useEffect(() => {
    if (!canReview) {
      return;
    }

    let isCurrentRequest = true;

    void listPendingPartnerApplications(page)
      .then((response) => {
        if (!isCurrentRequest) {
          return;
        }

        if (response.items.length === 0 && response.meta.total > 0 && page > 1) {
          setPage((currentPage) => currentPage - 1);
          return;
        }

        setItems(response.items);
        setTotal(response.meta.total);
        setTotalPages(response.meta.totalPages);
        setLoadedAt(Date.now());
        setLoadState("ready");
      })
      .catch((error: unknown) => {
        if (!isCurrentRequest) {
          return;
        }

        setErrorMessage(getListErrorMessage(error));
        setLoadState("error");
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [canReview, page]);

  async function handleApprove(application: PartnerApplication) {
    const wasConfirmed = window.confirm(
      `Aprovar ${application.tradeName}? O usuário ${application.contactEmail} será provisionado e receberá o e-mail para definir a senha.`,
    );

    if (!wasConfirmed) {
      return;
    }

    setApprovingId(application.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const approvedApplication = await approvePartnerApplication(application.id);
      setSuccessMessage(
        approvedApplication.invitationSent
          ? `${application.tradeName} foi aprovado e o convite foi enviado.`
          : `${application.tradeName} foi aprovado, mas o convite não foi confirmado pela API.`,
      );
      await loadApplications();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError && error.status === 409
          ? "Esta solicitação já foi analisada. A lista será atualizada."
          : getListErrorMessage(error),
      );

      if (error instanceof ApiError && error.status === 409) {
        await loadApplications();
      }
    } finally {
      setApprovingId(null);
    }
  }

  function refreshApplications() {
    setLoadState("loading");
    setErrorMessage(null);
    void loadApplications();
  }

  function goToPage(nextPage: number) {
    setLoadState("loading");
    setErrorMessage(null);
    setPage(nextPage);
  }

  if (!canReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert aria-hidden="true" />
            Análise de parceiros restrita
          </CardTitle>
          <CardDescription>
            Somente contas ADMIN ou SUPER_ADMIN podem consultar e aprovar solicitações.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="space-y-5" aria-labelledby="partner-applications-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="partner-applications-title" className="text-xl font-semibold">
              Solicitações de parceria
            </h2>
            <Badge variant="secondary">{total} pendente{total === 1 ? "" : "s"}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Revise os dados antes de autorizar o primeiro acesso do parceiro.
          </p>
        </div>
        <Button
          disabled={loadState === "loading"}
          onClick={refreshApplications}
          size="sm"
          variant="outline"
        >
          <RefreshCw
            className={loadState === "loading" ? "animate-spin" : undefined}
            aria-hidden="true"
          />
          Atualizar
        </Button>
      </div>

      {successMessage ? (
        <div
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-300"
          role="status"
        >
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {loadState === "loading" && items.length === 0 ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground" role="status">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Carregando solicitações...
        </div>
      ) : null}

      {loadState === "ready" && items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhuma solicitação aguarda análise neste momento.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {items.map((application) => (
          <ApplicationCard
            application={application}
            isDisabled={approvingId !== null}
            isApproving={approvingId === application.id}
            key={application.id}
            onApprove={(selectedApplication) => void handleApprove(selectedApplication)}
            referenceTime={loadedAt}
          />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between gap-4" aria-label="Paginação das solicitações">
          <Button
            disabled={page <= 1 || loadState === "loading"}
            onClick={() => goToPage(page - 1)}
            variant="outline"
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            disabled={page >= totalPages || loadState === "loading"}
            onClick={() => goToPage(page + 1)}
            variant="outline"
          >
            Próxima
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
