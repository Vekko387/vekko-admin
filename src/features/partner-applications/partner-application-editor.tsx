"use client";

import { LoaderCircle, Save } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PartnerApplication } from "@/features/partner-applications/partner-application";
import {
  updatePartnerApplication,
  type UpdatePartnerApplicationInput,
} from "@/features/partner-applications/partner-applications-service";
import { ApiError } from "@/services/api-error";

const inputClassName =
  "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 disabled:bg-muted";
const textareaClassName = `${inputClassName} min-h-28 resize-y py-3`;

function readString(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value.trim() : "";
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

export function PartnerApplicationEditor({
  application,
  onCancel,
  onSaved,
}: {
  application: PartnerApplication;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const input: UpdatePartnerApplicationInput = {
      addressComplement: readString(data, "addressComplement"),
      addressNumber: readString(data, "addressNumber"),
      businessCategory: readString(data, "businessCategory"),
      city: readString(data, "city"),
      cnpj: readString(data, "cnpj"),
      contactEmail: readString(data, "contactEmail"),
      contactPhone: readString(data, "contactPhone"),
      legalName: readString(data, "legalName"),
      neighborhood: readString(data, "neighborhood"),
      postalCode: readString(data, "postalCode"),
      responsibleCpf: readString(data, "responsibleCpf"),
      responsibleEmail: readString(data, "responsibleEmail"),
      responsibleName: readString(data, "responsibleName"),
      responsiblePhone: readString(data, "responsiblePhone"),
      responsibleRole: readString(data, "responsibleRole"),
      serviceDescription: readString(data, "serviceDescription"),
      state: readString(data, "state"),
      street: readString(data, "street"),
      tradeName: readString(data, "tradeName"),
      websiteOrInstagram: readString(data, "websiteOrInstagram"),
      whatsapp: readString(data, "whatsapp"),
    };

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updatePartnerApplication(application.id, input);
      await onSaved();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Não foi possível atualizar a solicitação.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="ring-2 ring-primary/20">
      <CardHeader>
        <CardTitle>Editar solicitação de {application.tradeName}</CardTitle>
        <CardDescription>
          O CNPJ ainda pode ser corrigido porque a solicitação não foi aprovada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {errorMessage ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" role="alert">{errorMessage}</p> : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Field defaultValue={application.legalName} disabled={isSaving} label="Razão social" maxLength={160} minLength={2} name="legalName" required />
            <Field defaultValue={application.tradeName} disabled={isSaving} label="Nome fantasia" maxLength={160} minLength={2} name="tradeName" required />
            <Field defaultValue={application.cnpj} disabled={isSaving} label="CNPJ" maxLength={18} name="cnpj" required />
            <Field defaultValue={application.businessCategory} disabled={isSaving} label="Categoria" maxLength={100} minLength={2} name="businessCategory" required />
            <Field defaultValue={application.websiteOrInstagram ?? ""} disabled={isSaving} label="Site ou Instagram" maxLength={255} name="websiteOrInstagram" />
            <Field defaultValue={application.contactEmail} disabled={isSaving} label="E-mail do estabelecimento" maxLength={320} name="contactEmail" required type="email" />
            <Field defaultValue={application.contactPhone} disabled={isSaving} label="Telefone" maxLength={20} name="contactPhone" required type="tel" />
            <Field defaultValue={application.whatsapp} disabled={isSaving} label="WhatsApp" maxLength={20} name="whatsapp" required type="tel" />
            <label className="space-y-1.5 text-sm font-medium md:col-span-2">Descrição do estabelecimento<textarea className={textareaClassName} defaultValue={application.serviceDescription} disabled={isSaving} maxLength={1000} minLength={10} name="serviceDescription" required /></label>
          </div>

          <fieldset className="grid gap-4 md:grid-cols-2">
            <legend className="mb-3 font-semibold">Responsável</legend>
            <Field defaultValue={application.responsibleName} disabled={isSaving} label="Nome completo" maxLength={160} minLength={2} name="responsibleName" required />
            <Field defaultValue={application.responsibleCpf ?? ""} disabled={isSaving} label="CPF" maxLength={14} name="responsibleCpf" required />
            <Field defaultValue={application.responsiblePhone} disabled={isSaving} label="Telefone" maxLength={20} name="responsiblePhone" required />
            <Field defaultValue={application.responsibleEmail} disabled={isSaving} label="E-mail" maxLength={320} name="responsibleEmail" required type="email" />
            <Field defaultValue={application.responsibleRole} disabled={isSaving} label="Cargo ou função" maxLength={100} minLength={2} name="responsibleRole" required />
          </fieldset>

          <fieldset className="grid gap-4 md:grid-cols-2">
            <legend className="mb-3 font-semibold">Endereço</legend>
            <Field defaultValue={application.postalCode} disabled={isSaving} label="CEP" maxLength={9} name="postalCode" required />
            <Field defaultValue={application.street} disabled={isSaving} label="Rua" maxLength={160} minLength={2} name="street" required />
            <Field defaultValue={application.addressNumber} disabled={isSaving} label="Número" maxLength={30} name="addressNumber" required />
            <Field defaultValue={application.addressComplement ?? ""} disabled={isSaving} label="Complemento" maxLength={120} name="addressComplement" />
            <Field defaultValue={application.neighborhood} disabled={isSaving} label="Bairro" maxLength={120} minLength={2} name="neighborhood" required />
            <Field defaultValue={application.city} disabled={isSaving} label="Cidade" maxLength={120} minLength={2} name="city" required />
            <Field defaultValue={application.state} disabled={isSaving} label="Estado (UF)" maxLength={2} minLength={2} name="state" required />
          </fieldset>

          <div className="flex flex-wrap gap-2">
            <Button disabled={isSaving} type="submit">{isSaving ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Save aria-hidden="true" />}{isSaving ? "Salvando..." : "Salvar correções"}</Button>
            <Button disabled={isSaving} onClick={onCancel} type="button" variant="outline">Cancelar</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
