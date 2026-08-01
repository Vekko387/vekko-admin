import { FirebaseError } from "firebase/app";

import {
  AdminAccessDeniedError,
  InvalidAuthResponseError,
} from "@/features/auth/auth-user";
import { ApiError } from "@/services/api-error";

export function getAuthenticationErrorMessage(error: unknown): string {
  if (error instanceof AdminAccessDeniedError) {
    return "Esta conta não tem acesso ao painel interno da VEKKO.";
  }

  if (error instanceof InvalidAuthResponseError) {
    return "Não foi possível validar os dados da sua conta. Tente novamente.";
  }

  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Sua sessão expirou. Entre novamente.";
    }

    if (error.status === 403) {
      return "Sua conta não tem permissão para realizar esta ação.";
    }

    return "Não foi possível conectar à VEKKO agora. Tente novamente.";
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "E-mail ou senha inválidos.";
      case "auth/invalid-email":
        return "Informe um e-mail válido.";
      case "auth/user-disabled":
        return "Esta conta está desativada. Fale com o responsável pela plataforma.";
      case "auth/too-many-requests":
        return "Muitas tentativas de acesso. Aguarde alguns minutos.";
      case "auth/network-request-failed":
        return "Sem conexão com o Firebase. Verifique sua internet.";
      case "auth/invalid-api-key":
      case "auth/configuration-not-found":
        return "A autenticação do painel ainda não está configurada corretamente.";
      default:
        return "Não foi possível autenticar. Tente novamente.";
    }
  }

  if (error instanceof Error && error.message.startsWith("Variável pública obrigatória")) {
    return "A autenticação do painel ainda não está configurada corretamente.";
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
