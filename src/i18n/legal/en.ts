import { field, type LegalBuilder } from "./types";

/** Terms of Use and Privacy Policy in English. Same structure as `pt-BR.ts`. */
export const legalEn: LegalBuilder = (c) => {
  const controller = field(c.controllerName, "company name");
  const document = field(c.controllerDocument, "CNPJ");
  const email = field(c.contactEmail, "contact email");
  const forum = field(c.forumCity, "court district");

  return {
    terms: {
      title: "Terms of Use",
      intro: `These Terms govern your use of the Vezzo app, provided by ${controller}, CNPJ ${document} ("Vezzo", "we"). Please read them before creating your account.`,
      sections: [
        {
          heading: "1. Acceptance",
          paragraphs: [
            "By creating an account or using Vezzo, you confirm that you have read and agree to these Terms and the Privacy Policy. If you do not agree, do not use the app.",
          ],
        },
        {
          heading: "2. The service",
          paragraphs: [
            "Vezzo is an app for tracking habits, following your streak and receiving reminders. It is not a medical app and does not replace advice from health professionals.",
          ],
        },
        {
          heading: "3. Who can use it",
          paragraphs: [
            `Vezzo is intended for people aged ${c.minAge} or older. If you are under 18, use the app with the knowledge and permission of your parents or guardians.`,
          ],
        },
        {
          heading: "4. Your account",
          paragraphs: [
            `You are responsible for your account information and for keeping your password safe. Tell us at ${email} if you suspect misuse. Signing in with Apple or Google is also subject to those services' terms.`,
          ],
        },
        {
          heading: "5. Acceptable use",
          paragraphs: ["You agree not to:"],
          items: [
            "use the app to break the law or violate others' rights;",
            "try to access other people's accounts, data or systems;",
            "overload, attack or reverse engineer the service, except where the law allows it;",
            "use automated means to create accounts or access the service in bulk.",
          ],
        },
        {
          heading: "6. Your content",
          paragraphs: [
            "The habits and records you create are yours. You authorize us to store, sync and process them only to provide the service, as described in the Privacy Policy.",
          ],
        },
        {
          heading: "7. Intellectual property",
          paragraphs: [
            "The app, the Vezzo brand, the design and the code belong to us or our licensors. You receive a personal, limited, revocable, non-exclusive license to use the app, without the right to copy, resell or distribute it.",
          ],
        },
        {
          heading: "8. Notifications and availability",
          paragraphs: [
            "We work to keep the service running, but it may be unavailable for maintenance or because of failures. Reminders depend on the operating system and device permissions and may be delayed or not delivered.",
          ],
        },
        {
          heading: "9. Third-party services",
          paragraphs: [
            "The app relies on third-party services such as hosting, email and notifications. They are governed by their own terms and listed in the Privacy Policy.",
          ],
        },
        {
          heading: "10. Termination",
          paragraphs: [
            "You can delete your account at any time in Profile → Delete account. We may suspend or end accounts that violate these Terms, notifying you when possible.",
          ],
        },
        {
          heading: "11. Limitation of liability",
          paragraphs: [
            "The service is provided as is. To the extent permitted by law, we are not liable for indirect damages or lost profits arising from use of, or inability to use, the app. Nothing in these Terms limits rights that the law grants to consumers.",
          ],
        },
        {
          heading: "12. Changes",
          paragraphs: [
            "We may update these Terms. We will notify you in the app of relevant changes, and the update date appears at the top of this page. Continuing to use the app after the notice means you accept the new version.",
          ],
        },
        {
          heading: "13. Governing law and venue",
          paragraphs: [
            `These Terms are governed by Brazilian law. The courts of the district of ${forum} have jurisdiction, without prejudice to the consumer's right to sue in their place of residence.`,
          ],
        },
        {
          heading: "14. Contact",
          paragraphs: [`Questions about these Terms: ${email}.`],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      intro:
        "This Policy explains which personal data Vezzo processes, why, who we share it with and what your rights are, in line with the Brazilian General Data Protection Law (LGPD, Law 13,709/2018).",
      sections: [
        {
          heading: "1. Who we are",
          paragraphs: [
            `The data controller is ${controller}, CNPJ ${document}. The contact for the data protection officer (DPO) is ${email}.`,
          ],
        },
        {
          heading: "2. Data we collect",
          items: [
            "Account: email, display name and password (stored only as a hash). With Apple or Google, we receive the account identifier and, if you allow it, your name and email.",
            "Habits and records: each habit's name, emoji, goal, days and reminder times; each day's value, status and completion time, and whether the record came from the app or from a notification.",
            "Preferences: language, time zone, accent color and theme mode.",
            "Push notification token and platform (iOS or Android), to deliver your reminders.",
            "Technical session data: IP address and device or browser type, recorded when you sign in, to keep your account secure.",
            "Crash diagnostics: error reports with device model, system and app version, without your name, email or habit content.",
          ],
          outro: [
            "We do not collect location, contacts, photos or advertising identifiers. We do not sell your data, show ads or track you across apps or websites.",
          ],
        },
        {
          heading: "3. Why we use it and legal bases",
          items: [
            "Provide the service: create your account, sync habits and records, and calculate streaks and summaries (performance of a contract, art. 7, V).",
            "Send the reminders and notifications you set up (consent, art. 7, I, which you can withdraw in your device settings).",
            "Send account emails such as email confirmation and password reset (performance of a contract).",
            "Keep the app stable and secure: crash diagnostics and abuse protection (legitimate interest, art. 7, IX).",
            "Comply with legal obligations or respond to authority orders (art. 7, II).",
          ],
          outro: ["We do not make automated decisions that produce effects on you."],
        },
        {
          heading: "4. Who we share it with",
          paragraphs: [
            "We share data only with processors that handle information on our behalf, for the purposes above:",
          ],
          items: [
            `Server hosting: ${c.hostingProvider}.`,
            "Database: MongoDB Atlas.",
            "Account emails: Resend.",
            "Push notification delivery: Expo Push Service, which forwards to Apple (APNs) and Google (FCM).",
            "Crash reporting: Sentry.",
            "Social sign-in, if you choose it: Apple and Google.",
          ],
        },
        {
          heading: "5. International transfers",
          paragraphs: [
            "Some of these processors store data outside Brazil. In that case we apply the safeguards of art. 33 of the LGPD, such as contractual clauses and providers that maintain an adequate level of protection.",
          ],
        },
        {
          heading: "6. How long we keep it",
          paragraphs: [
            `We keep your data while your account exists. When you delete the account in Profile → Delete account, we erase your data from the service immediately and from backups within ${c.deletionDays} days, except what the law requires us to keep longer.`,
          ],
        },
        {
          heading: "7. Your rights",
          paragraphs: ["Under the LGPD (art. 18), you may request at any time:"],
          items: [
            "confirmation that we process your data, and access to it;",
            "correction of incomplete, inaccurate or outdated data;",
            "anonymization, blocking or deletion of unnecessary data or data processed unlawfully;",
            "data portability;",
            "information about who we share data with;",
            "information about the option to refuse consent and its consequences;",
            "withdrawal of consent;",
            "objection to processing based on legitimate interest.",
          ],
        },
        {
          heading: "8. How to exercise your rights",
          paragraphs: [
            `Write to ${email}. We reply within ${c.responseDays} days. You can also delete your account directly in the app and, if you believe the processing violates the law, you have the right to complain to the Brazilian National Data Protection Authority (ANPD).`,
          ],
        },
        {
          heading: "9. Security",
          paragraphs: [
            "We use HTTPS, passwords stored only as hashes, sessions managed by Better Auth and restricted access to data. No system is completely secure; in case of an incident that may cause relevant harm, we will notify you and the ANPD as the law requires.",
          ],
        },
        {
          heading: "10. Children and teenagers",
          paragraphs: [
            `Vezzo is not directed at children under ${c.minAge} and we do not knowingly collect their data. If we find such an account, we will delete it. Teenagers should use the app with their guardians' knowledge, and processing of their data follows the teenager's best interests (art. 14 of the LGPD).`,
          ],
        },
        {
          heading: "11. Changes to this Policy",
          paragraphs: [
            "We may update this Policy. We will notify you in the app of relevant changes, and the date of the last update appears at the top of this page.",
          ],
        },
        {
          heading: "12. Contact",
          paragraphs: [`Privacy questions: ${email}.`],
        },
      ],
    },
    "account-deletion": {
      title: "Delete account and data",
      intro: `This page explains how to delete your account and data in the Vezzo app, offered by ${controller}, CNPJ ${document}.`,
      sections: [
        {
          heading: "1. In the app",
          paragraphs: ["You can delete your account at any time, without contacting anyone:"],
          items: [
            "Open Vezzo and sign in to your account.",
            "Tap the Profile tab.",
            "Tap Delete account.",
            "If the app asks, confirm your password and tap Delete permanently.",
          ],
          outro: [
            "For your security, if your sign-in is not recent, the app asks you to sign out and back in before deleting. Deletion is permanent and cannot be undone.",
          ],
        },
        {
          heading: "2. Without access to the app",
          paragraphs: [
            `If you cannot sign in or have already uninstalled the app, write to ${email} from the email registered on the account, asking for deletion. We confirm the account is yours and reply within ${c.responseDays} days.`,
          ],
        },
        {
          heading: "3. What is deleted",
          paragraphs: ["When you delete your account, we erase from the service, immediately:"],
          items: [
            "your name, your email and your password (stored only as a hash);",
            "your profile and preferences (accent color, theme, language and time zone);",
            "all your habits, entries and streak history;",
            "the push notification tokens of your devices;",
            "your sessions and linked sign-ins (Apple and Google).",
          ],
        },
        {
          heading: "4. What may be kept",
          paragraphs: [
            `Database backups may contain your data for up to ${c.deletionDays} days after deletion, until they are overwritten. Crash reports contain no personal data and are not linked to your account. We only keep anything longer when the law requires it.`,
          ],
        },
        {
          heading: "5. Contact",
          paragraphs: [`Questions about deletion: ${email}.`],
        },
      ],
    },
  };
};
