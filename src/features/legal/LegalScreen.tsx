import { Linking, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import { SettingsShell } from "@/features/profile/SettingsShell";
import { getLegalDocument, type LegalKind } from "@/i18n/legal";
import { useLocale } from "@/i18n/useLocale";
import { useT } from "@/i18n/useT";
import { formatLongDate } from "@/lib/format";
import { LEGAL_CONFIG } from "@/shared/legal/config";

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

/** Texto com o e-mail de contato (se houver) tocável, abrindo o app de e-mail. */
function Paragraph({ text }: { text: string }) {
  const match = EMAIL.exec(text);
  if (!match) return <Text tone="mute">{text}</Text>;
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + match[0].length);
  return (
    <Text tone="mute">
      {before}
      <Text
        tone="acc"
        accessibilityRole="link"
        onPress={() => void Linking.openURL(`mailto:${match[0]}`)}
        style={styles.link}
      >
        {match[0]}
      </Text>
      {after}
    </Text>
  );
}

/** Termos de Uso / Política de Privacidade. Pública: abre com ou sem sessão, no app e na web. */
export function LegalScreen({ kind }: { kind: LegalKind }) {
  const t = useT();
  const locale = useLocale();
  const doc = getLegalDocument(kind, locale);

  return (
    <SettingsShell tabBar={false} title={doc.title} back>
      <Text variant="caption" tone="mute">
        {t("legal.updated", { date: formatLongDate(LEGAL_CONFIG.updatedAt, locale) })}
      </Text>
      {doc.intro ? <Paragraph text={doc.intro} /> : null}
      {doc.sections.map((section) => (
        <View key={section.heading} style={styles.section}>
          <Text variant="sectionTitle" accessibilityRole="header">
            {section.heading}
          </Text>
          {section.paragraphs?.map((paragraph) => (
            <Paragraph key={paragraph} text={paragraph} />
          ))}
          {section.items?.map((item) => (
            <View key={item} style={styles.item}>
              <Text tone="mute" accessibilityElementsHidden importantForAccessibility="no">
                •
              </Text>
              <View style={styles.itemText}>
                <Paragraph text={item} />
              </View>
            </View>
          ))}
          {section.outro?.map((paragraph) => (
            <Paragraph key={paragraph} text={paragraph} />
          ))}
        </View>
      ))}
    </SettingsShell>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8, marginTop: 8 },
  item: { flexDirection: "row", gap: 8, paddingLeft: 4 },
  itemText: { flex: 1 },
  link: { textDecorationLine: "underline" },
});
