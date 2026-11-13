import { ScrollViewStyleReset, useServerDocumentContext } from "expo-router/html";
import type { PropsWithChildren } from "react";
import { SITE_URL } from "@/shared/landing";

const TITLE = "Vezzo: Hábitos Diários";
const DESCRIPTION =
  "Crie hábitos, receba lembretes na hora certa e acompanhe sua sequência. Marque como feito direto na notificação.";

/** Documento HTML da web (renderização no servidor): metadados, idioma e Open Graph da landing. */
export default function Root({ children }: PropsWithChildren) {
  // Scripts, CSS e fontes do bundle chegam pelo contexto do servidor: sem renderizá-los a página fica em branco.
  const { htmlAttributes, bodyAttributes, headNodes, bodyNodes } = useServerDocumentContext();
  return (
    <html lang="pt-BR" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="theme-color" content="#121413" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Vezzo" />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={`${SITE_URL}/og.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href={SITE_URL} />
        <ScrollViewStyleReset />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}
