import { field, type LegalBuilder } from "./types";

/** Termos de Uso e Política de Privacidade em português. Fonte única dos textos (app e web). */
export const legalPtBR: LegalBuilder = (c) => {
  const controller = field(c.controllerName, "razão social");
  const document = field(c.controllerDocument, "CNPJ");
  const email = field(c.contactEmail, "e-mail de contato");
  const forum = field(c.forumCity, "comarca");

  return {
    terms: {
      title: "Termos de Uso",
      intro: `Estes Termos regem o uso do aplicativo Vezzo, oferecido por ${controller}, CNPJ ${document} ("Vezzo", "nós"). Leia com atenção antes de criar sua conta.`,
      sections: [
        {
          heading: "1. Aceite",
          paragraphs: [
            "Ao criar uma conta ou usar o Vezzo, você declara que leu e concorda com estes Termos e com a Política de Privacidade. Se não concordar, não utilize o aplicativo.",
          ],
        },
        {
          heading: "2. O serviço",
          paragraphs: [
            "O Vezzo é um aplicativo para registrar hábitos, acompanhar sua sequência e receber lembretes. Ele não é um aplicativo médico e não substitui orientação de profissionais de saúde.",
          ],
        },
        {
          heading: "3. Quem pode usar",
          paragraphs: [
            `O Vezzo é destinado a pessoas com ${c.minAge} anos ou mais. Se você tem menos de 18 anos, use o app com a ciência e a autorização de seus pais ou responsáveis.`,
          ],
        },
        {
          heading: "4. Sua conta",
          paragraphs: [
            "Você é responsável pelas informações da conta e pela guarda da senha. Avise-nos em " +
              `${email} se suspeitar de uso indevido. Entrar com Apple ou Google está sujeito também aos termos desses serviços.`,
          ],
        },
        {
          heading: "5. Uso adequado",
          paragraphs: ["Você concorda em não:"],
          items: [
            "usar o app para violar a lei ou direitos de terceiros;",
            "tentar acessar contas, dados ou sistemas de outras pessoas;",
            "sobrecarregar, atacar ou fazer engenharia reversa do serviço, salvo quando a lei permitir;",
            "usar meios automatizados para criar contas ou acessar o serviço em massa.",
          ],
        },
        {
          heading: "6. Seu conteúdo",
          paragraphs: [
            "Os hábitos e registros que você cria são seus. Você nos autoriza a armazená-los, sincronizá-los e processá-los apenas para prestar o serviço, conforme a Política de Privacidade.",
          ],
        },
        {
          heading: "7. Propriedade intelectual",
          paragraphs: [
            "O aplicativo, a marca Vezzo, o design e o código pertencem a nós ou a nossos licenciantes. Você recebe uma licença pessoal, limitada, revogável e não exclusiva para usar o app, sem direito de copiar, revender ou distribuir.",
          ],
        },
        {
          heading: "8. Notificações e disponibilidade",
          paragraphs: [
            "Nos esforçamos para manter o serviço no ar, mas ele pode ficar indisponível por manutenção ou falhas. Os lembretes dependem do sistema operacional e das permissões do aparelho e podem atrasar ou não ser entregues.",
          ],
        },
        {
          heading: "9. Serviços de terceiros",
          paragraphs: [
            "O app usa serviços de terceiros, como hospedagem, envio de e-mail e notificações. Eles são regidos por seus próprios termos e descritos na Política de Privacidade.",
          ],
        },
        {
          heading: "10. Encerramento",
          paragraphs: [
            "Você pode excluir a conta a qualquer momento em Perfil → Excluir conta. Podemos suspender ou encerrar contas que violem estes Termos, avisando você quando possível.",
          ],
        },
        {
          heading: "11. Limitação de responsabilidade",
          paragraphs: [
            "O serviço é fornecido no estado em que se encontra. Na extensão permitida pela lei, não respondemos por danos indiretos ou lucros cessantes decorrentes do uso ou da impossibilidade de uso do app. Nada nestes Termos limita direitos que a lei assegura ao consumidor.",
          ],
        },
        {
          heading: "12. Alterações",
          paragraphs: [
            "Podemos atualizar estes Termos. Avisaremos no app sobre mudanças relevantes, e a data de atualização aparece no topo desta página. Continuar usando o app depois do aviso significa que você aceita a nova versão.",
          ],
        },
        {
          heading: "13. Lei e foro",
          paragraphs: [
            `Estes Termos seguem a lei brasileira. Fica eleito o foro da comarca de ${forum}, sem prejuízo do foro do domicílio do consumidor.`,
          ],
        },
        {
          heading: "14. Contato",
          paragraphs: [`Dúvidas sobre estes Termos: ${email}.`],
        },
      ],
    },
    privacy: {
      title: "Política de Privacidade",
      intro:
        "Esta Política explica quais dados pessoais o Vezzo trata, para quê, com quem compartilha e quais são os seus direitos, em conformidade com a Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).",
      sections: [
        {
          heading: "1. Quem somos",
          paragraphs: [
            `O controlador dos dados é ${controller}, CNPJ ${document}. O contato do encarregado pelo tratamento de dados pessoais (DPO) é ${email}.`,
          ],
        },
        {
          heading: "2. Dados que coletamos",
          items: [
            "Conta: e-mail, nome de exibição e senha (guardada apenas como hash). Com Apple ou Google, recebemos o identificador da conta e, se você permitir, nome e e-mail.",
            "Hábitos e registros: nome, emoji, meta, dias e horários de lembrete dos hábitos; valor, status e horário de conclusão de cada dia, e se o registro veio do app ou da notificação.",
            "Preferências: idioma, fuso horário, cor de destaque e modo de tema.",
            "Token de notificação push e plataforma (iOS ou Android), para enviar seus lembretes.",
            "Dados técnicos da sessão: endereço IP e tipo de aparelho ou navegador, registrados quando você entra, para manter sua conta segura.",
            "Diagnóstico de falhas: relatórios de erro com modelo do aparelho, versão do sistema e do app, sem seu nome, e-mail nem o conteúdo dos hábitos.",
          ],
          outro: [
            "Não coletamos localização, contatos, fotos nem identificadores de publicidade. Não vendemos seus dados, não exibimos anúncios e não fazemos rastreamento entre apps ou sites.",
          ],
        },
        {
          heading: "3. Para que usamos e bases legais",
          items: [
            "Prestar o serviço: criar sua conta, sincronizar hábitos e registros e calcular sequência e resumos (execução de contrato, art. 7º, V).",
            "Enviar lembretes e notificações que você configurou (consentimento, art. 7º, I, que você pode revogar nos Ajustes do aparelho).",
            "Enviar e-mails da conta, como confirmação de e-mail e redefinição de senha (execução de contrato).",
            "Manter o app estável e seguro: diagnóstico de falhas e proteção contra abuso (legítimo interesse, art. 7º, IX).",
            "Cumprir obrigações legais ou responder a ordens de autoridades (art. 7º, II).",
          ],
          outro: ["Não tomamos decisões automatizadas que produzam efeitos sobre você."],
        },
        {
          heading: "4. Com quem compartilhamos",
          paragraphs: [
            "Compartilhamos dados apenas com operadores que tratam informações em nosso nome, para as finalidades acima:",
          ],
          items: [
            `Hospedagem do servidor: ${c.hostingProvider}.`,
            "Banco de dados: MongoDB Atlas.",
            "Envio de e-mails da conta: Resend.",
            "Entrega de notificações push: Expo Push Service, que repassa à Apple (APNs) e ao Google (FCM).",
            "Relatório de falhas: Sentry.",
            "Login social, se você escolher: Apple e Google.",
          ],
        },
        {
          heading: "5. Transferência internacional",
          paragraphs: [
            "Alguns desses operadores armazenam dados fora do Brasil. Nesses casos, adotamos as salvaguardas do art. 33 da LGPD, como cláusulas contratuais e provedores que mantêm padrão adequado de proteção.",
          ],
        },
        {
          heading: "6. Por quanto tempo guardamos",
          paragraphs: [
            `Mantemos seus dados enquanto sua conta existir. Ao excluir a conta em Perfil → Excluir conta, apagamos seus dados do serviço imediatamente e das cópias de segurança em até ${c.deletionDays} dias, salvo o que a lei exigir guardar por mais tempo.`,
          ],
        },
        {
          heading: "7. Seus direitos",
          paragraphs: ["Pela LGPD (art. 18), você pode pedir a qualquer momento:"],
          items: [
            "confirmação de que tratamos seus dados e acesso a eles;",
            "correção de dados incompletos, inexatos ou desatualizados;",
            "anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade;",
            "portabilidade dos dados;",
            "informação sobre com quem compartilhamos;",
            "informação sobre a possibilidade de não consentir e suas consequências;",
            "revogação do consentimento;",
            "oposição a tratamento feito com base em legítimo interesse.",
          ],
        },
        {
          heading: "8. Como exercer seus direitos",
          paragraphs: [
            `Escreva para ${email}. Respondemos em até ${c.responseDays} dias. Você também pode excluir a conta direto no app e, se entender que o tratamento viola a lei, tem o direito de reclamar à Autoridade Nacional de Proteção de Dados (ANPD).`,
          ],
        },
        {
          heading: "9. Segurança",
          paragraphs: [
            "Usamos comunicação por HTTPS, senhas armazenadas apenas como hash, sessões gerenciadas pelo Better Auth e acesso restrito aos dados. Nenhum sistema é totalmente seguro; em caso de incidente que possa causar dano relevante, avisaremos você e a ANPD, como a lei determina.",
          ],
        },
        {
          heading: "10. Crianças e adolescentes",
          paragraphs: [
            `O Vezzo não é direcionado a menores de ${c.minAge} anos e não coletamos dados deles de forma intencional. Se descobrirmos uma conta assim, vamos excluí-la. Adolescentes devem usar o app com a ciência de seus responsáveis, e o tratamento de seus dados observa o melhor interesse do adolescente (art. 14 da LGPD).`,
          ],
        },
        {
          heading: "11. Mudanças nesta Política",
          paragraphs: [
            "Podemos atualizar esta Política. Avisaremos no app sobre mudanças relevantes, e a data da última atualização aparece no topo desta página.",
          ],
        },
        {
          heading: "12. Contato",
          paragraphs: [`Dúvidas sobre privacidade: ${email}.`],
        },
      ],
    },
    "account-deletion": {
      title: "Excluir conta e dados",
      intro: `Esta página explica como excluir sua conta e seus dados no aplicativo Vezzo, oferecido por ${controller}, CNPJ ${document}.`,
      sections: [
        {
          heading: "1. Pelo aplicativo",
          paragraphs: ["Você pode excluir a conta a qualquer momento, sem falar com ninguém:"],
          items: [
            "Abra o Vezzo e entre na sua conta.",
            "Toque na aba Perfil.",
            "Toque em Excluir conta.",
            "Se o app pedir, confirme sua senha e toque em Excluir definitivamente.",
          ],
          outro: [
            "Por segurança, se o seu login não for recente, o app pede que você saia e entre de novo antes de excluir. A exclusão é definitiva e não pode ser desfeita.",
          ],
        },
        {
          heading: "2. Sem acesso ao aplicativo",
          paragraphs: [
            `Se você não consegue entrar ou já desinstalou o app, escreva para ${email} a partir do e-mail cadastrado na conta, pedindo a exclusão. Confirmamos que a conta é sua e respondemos em até ${c.responseDays} dias.`,
          ],
        },
        {
          heading: "3. O que é excluído",
          paragraphs: ["Ao excluir a conta, apagamos do serviço, imediatamente:"],
          items: [
            "seu nome, seu e-mail e sua senha (guardada apenas como hash);",
            "seu perfil e suas preferências (cor de destaque, tema, idioma e fuso horário);",
            "todos os seus hábitos, registros e o histórico de sequência;",
            "os tokens de notificações push dos seus aparelhos;",
            "suas sessões e os logins vinculados (Apple e Google).",
          ],
        },
        {
          heading: "4. O que pode ser mantido",
          paragraphs: [
            `Cópias de segurança do banco de dados podem conter seus dados por até ${c.deletionDays} dias depois da exclusão, até serem sobrescritas. Os relatórios de falhas não têm dados pessoais e não são ligados à sua conta. Só guardamos por mais tempo o que a lei exigir.`,
          ],
        },
        {
          heading: "5. Contato",
          paragraphs: [`Dúvidas sobre a exclusão: ${email}.`],
        },
      ],
    },
  };
};
