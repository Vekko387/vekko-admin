"use client";

import { Ban, CheckCircle2, LoaderCircle, Pencil, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PARTNER_PHOTO_TYPES,
  type Partner,
  type PartnerPhotoType,
  type UpdatePartnerInput,
} from "@/features/partners/partner";
import {
  listPartners,
  updatePartner,
  updatePartnerStatus,
} from "@/features/partners/partners-service";
import { ApiError } from "@/services/api-error";

const inputClassName =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:bg-muted";
const textareaClassName = `${inputClassName} min-h-28 resize-y py-3`;
const PHOTO_LABELS: Record<PartnerPhotoType, string> = {
  FACADE: "Fachada",
  LOGO: "Logo",
  SERVICE_AREA: "Área de atendimento",
};

function readString(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function formatCnpj(value: string): string {
  return value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function Field({
  defaultValue,
  label,
  name,
  ...props
}: {
  defaultValue?: string;
  label: string;
  name: string;
} & Omit<React.ComponentProps<"input">, "defaultValue" | "name">) {
  return (
    <label className="space-y-1.5 text-sm font-medium">
      {label}
      <input {...props} className={inputClassName} defaultValue={defaultValue} name={name} />
    </label>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Não foi possível concluir a operação.";
}

function PartnerEditor({
  onCancel,
  onSaved,
  partner,
}: {
  onCancel: () => void;
  onSaved: (partner: Partner) => void;
  partner: Partner;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const responsibleCpf = readString(data, "responsibleCpf");
    const input: UpdatePartnerInput = {
      addressComplement: readString(data, "addressComplement"),
      addressNumber: readString(data, "addressNumber"),
      businessCategory: readString(data, "businessCategory"),
      city: readString(data, "city"),
      contactEmail: readString(data, "contactEmail"),
      contactPhone: readString(data, "contactPhone"),
      legalName: readString(data, "legalName"),
      neighborhood: readString(data, "neighborhood"),
      postalCode: readString(data, "postalCode"),
      responsibleEmail: readString(data, "responsibleEmail"),
      responsibleName: readString(data, "responsibleName"),
      responsiblePhone: readString(data, "responsiblePhone"),
      responsibleRole: readString(data, "responsibleRole"),
      serviceDescription: readString(data, "description"),
      state: readString(data, "state"),
      street: readString(data, "street"),
      tradeName: readString(data, "tradeName"),
      websiteOrInstagram: readString(data, "websiteOrInstagram"),
      whatsapp: readString(data, "whatsapp"),
      ...(responsibleCpf ? { responsibleCpf } : {}),
    };

    setIsSaving(true);
    setErrorMessage(null);

    try {
      onSaved(await updatePartner(partner.id, input));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="ring-2 ring-primary/20">
      <CardHeader>
        <CardTitle>Editar {partner.tradeName}</CardTitle>
        <CardDescription>O CNPJ não pode ser alterado após a aprovação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {errorMessage ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">{errorMessage}</p> : null}
          <div className="grid gap-4 md:grid-cols-2">
            <Field defaultValue={partner.legalName} disabled={isSaving} label="Razão social" maxLength={160} minLength={2} name="legalName" required />
            <Field defaultValue={partner.tradeName} disabled={isSaving} label="Nome fantasia" maxLength={160} minLength={2} name="tradeName" required />
            <Field defaultValue={formatCnpj(partner.cnpj)} disabled label="CNPJ" name="cnpj" readOnly />
            <Field defaultValue={partner.businessCategory} disabled={isSaving} label="Categoria" maxLength={100} minLength={2} name="businessCategory" required />
            <Field defaultValue={partner.websiteOrInstagram ?? ""} disabled={isSaving} label="Site ou Instagram" maxLength={255} name="websiteOrInstagram" />
            <Field defaultValue={partner.contactEmail} disabled={isSaving} label="E-mail" maxLength={320} name="contactEmail" required type="email" />
            <Field defaultValue={partner.contactPhone} disabled={isSaving} label="Telefone" maxLength={20} name="contactPhone" required />
            <Field defaultValue={partner.whatsapp} disabled={isSaving} label="WhatsApp" maxLength={20} name="whatsapp" required />
            <label className="space-y-1.5 text-sm font-medium md:col-span-2">Descrição<textarea className={textareaClassName} defaultValue={partner.description} disabled={isSaving} maxLength={1000} minLength={10} name="description" required /></label>
          </div>
          <fieldset className="grid gap-4 md:grid-cols-2">
            <legend className="mb-3 font-semibold">Responsável</legend>
            <Field defaultValue={partner.responsibleName} disabled={isSaving} label="Nome completo" maxLength={160} minLength={2} name="responsibleName" required />
            <Field defaultValue={partner.responsibleCpf ?? ""} disabled={isSaving} label="CPF" maxLength={14} name="responsibleCpf" required />
            <Field defaultValue={partner.responsiblePhone} disabled={isSaving} label="Telefone" maxLength={20} name="responsiblePhone" required />
            <Field defaultValue={partner.responsibleEmail} disabled={isSaving} label="E-mail" maxLength={320} name="responsibleEmail" required type="email" />
            <Field defaultValue={partner.responsibleRole} disabled={isSaving} label="Cargo ou função" maxLength={100} minLength={2} name="responsibleRole" required />
          </fieldset>
          <fieldset className="grid gap-4 md:grid-cols-2">
            <legend className="mb-3 font-semibold">Endereço</legend>
            <Field defaultValue={partner.postalCode} disabled={isSaving} label="CEP" maxLength={9} name="postalCode" required />
            <Field defaultValue={partner.street} disabled={isSaving} label="Rua" maxLength={160} minLength={2} name="street" required />
            <Field defaultValue={partner.addressNumber} disabled={isSaving} label="Número" maxLength={30} name="addressNumber" required />
            <Field defaultValue={partner.addressComplement ?? ""} disabled={isSaving} label="Complemento" maxLength={120} name="addressComplement" />
            <Field defaultValue={partner.neighborhood} disabled={isSaving} label="Bairro" maxLength={120} minLength={2} name="neighborhood" required />
            <Field defaultValue={partner.city} disabled={isSaving} label="Cidade" maxLength={120} minLength={2} name="city" required />
            <Field defaultValue={partner.state} disabled={isSaving} label="Estado (UF)" maxLength={2} minLength={2} name="state" required />
          </fieldset>
          <div className="flex gap-2">
            <Button disabled={isSaving} type="submit">{isSaving ? "Salvando..." : "Salvar alterações"}</Button>
            <Button disabled={isSaving} onClick={onCancel} type="button" variant="outline">Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function ApprovedPartnersPanel() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listPartners();
      setPartners(response.items);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    void listPartners()
      .then((response) => {
        if (!ignore) {
          setPartners(response.items);
          setErrorMessage(null);
        }
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
  }, []);

  async function handleStatus(partner: Partner) {
    const nextStatus = partner.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    const action = nextStatus === "SUSPENDED" ? "bloquear" : "desbloquear";
    if (!window.confirm(`Deseja ${action} ${partner.tradeName}?`)) return;

    setPendingId(partner.id);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const updated = await updatePartnerStatus(partner.id, nextStatus);
      setPartners((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSuccessMessage(`${partner.tradeName} foi ${nextStatus === "SUSPENDED" ? "bloqueado" : "desbloqueado"}.`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingId(null);
    }
  }

  const editingPartner = partners.find(({ id }) => id === editingId) ?? null;

  return (
    <section className="space-y-5" aria-labelledby="approved-partners-title">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-xl font-semibold" id="approved-partners-title">Parceiros aprovados</h2><Badge variant="secondary">{partners.length}</Badge></div>
          <p className="mt-1 text-sm text-muted-foreground">Consulte, edite, bloqueie e desbloqueie estabelecimentos.</p>
        </div>
        <Button disabled={isLoading} onClick={() => void load()} variant="outline"><RefreshCw className={isLoading ? "animate-spin" : undefined} aria-hidden="true" /> Atualizar</Button>
      </div>

      {successMessage ? <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700" role="status">{successMessage}</p> : null}
      {errorMessage ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">{errorMessage}</p> : null}
      {editingPartner ? <PartnerEditor key={editingPartner.updatedAt} onCancel={() => setEditingId(null)} onSaved={(updated) => { setPartners((current) => current.map((item) => item.id === updated.id ? updated : item)); setEditingId(null); setSuccessMessage("Parceiro atualizado com sucesso."); }} partner={editingPartner} /> : null}

      {isLoading && partners.length === 0 ? <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" aria-hidden="true" /> Carregando parceiros...</div> : null}
      {!isLoading && partners.length === 0 ? <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">Nenhum parceiro aprovado foi encontrado.</CardContent></Card> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {partners.map((partner) => (
          <Card key={partner.id} className={partner.status === "SUSPENDED" ? "opacity-80" : undefined}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div><CardTitle>{partner.tradeName}</CardTitle><CardDescription>{partner.legalName} · {formatCnpj(partner.cnpj)}</CardDescription></div>
                <Badge variant={partner.status === "ACTIVE" ? "secondary" : "destructive"}>{partner.status === "ACTIVE" ? "Ativo" : "Suspenso"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-xs text-muted-foreground">Categoria</dt><dd>{partner.businessCategory}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Responsável</dt><dd>{partner.responsibleName} · {partner.responsibleRole}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Contato</dt><dd>{partner.contactEmail}<br />{partner.contactPhone} · WhatsApp {partner.whatsapp}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Endereço</dt><dd>{partner.street}, {partner.addressNumber} · {partner.city}/{partner.state}</dd></div>
              </dl>
              <p className="text-sm text-muted-foreground">{partner.description}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {PARTNER_PHOTO_TYPES.map((type) => {
                  const photo = partner.photos.find((candidate) => candidate.type === type);
                  return <div className="overflow-hidden rounded-lg border" key={type}>{photo ? <Image alt={`${PHOTO_LABELS[type]} de ${partner.tradeName}`} className="aspect-video w-full object-cover" height={180} sizes="(max-width: 640px) 100vw, 16vw" src={photo.url} width={320} /> : <div className="flex aspect-video items-center justify-center bg-muted px-2 text-center text-xs text-muted-foreground">Sem foto</div>}<p className="p-2 text-xs font-medium">{PHOTO_LABELS[type]}</p></div>;
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={pendingId !== null} onClick={() => setEditingId(partner.id)} variant="outline"><Pencil aria-hidden="true" /> Editar</Button>
                <Button disabled={pendingId !== null} onClick={() => void handleStatus(partner)} variant={partner.status === "ACTIVE" ? "destructive" : "secondary"}>{pendingId === partner.id ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : partner.status === "ACTIVE" ? <Ban aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}{partner.status === "ACTIVE" ? "Bloquear" : "Desbloquear"}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
