import { Redirect } from "expo-router";

/** Qualquer endereço que não seja landing, termos/privacidade ou API volta para a raiz (na web, a landing; no app, o gate de sessão). */
export default function NotFound() {
  return <Redirect href="/" />;
}
