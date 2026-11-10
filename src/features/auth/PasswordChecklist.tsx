import { StyleSheet, View } from "react-native";
import { Text } from "@/components/ui";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";

interface Props {
  checks: { length: boolean; charset: boolean; match: boolean };
}

/** Checklist ao vivo da nova senha: círculo 20, marcado = `acc` com ✓ (docs/05). */
export function PasswordChecklist({ checks }: Props) {
  const t = useT();
  const items = [
    { ok: checks.length, label: t("auth.ruleLength") },
    { ok: checks.charset, label: t("auth.ruleCharset") },
    { ok: checks.match, label: t("auth.ruleMatch") },
  ];
  return (
    <View style={styles.list} accessibilityLiveRegion="polite">
      {items.map((item) => (
        <Row key={item.label} {...item} />
      ))}
    </View>
  );
}

function Row({ ok, label }: { ok: boolean; label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.row} accessible accessibilityLabel={label} accessibilityState={{ checked: ok }}>
      <View
        style={[
          styles.circle,
          ok
            ? { backgroundColor: theme.acc, borderColor: theme.acc }
            : { backgroundColor: theme.card, borderColor: theme.line },
        ]}
      >
        {ok ? (
          <Text tone="accInk" style={styles.check}>
            ✓
          </Text>
        ) : null}
      </View>
      <Text variant="bodyMedium" tone={ok ? "ink" : "mute"}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 28 },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  check: { fontSize: 12, lineHeight: 14, fontWeight: "800" },
});
