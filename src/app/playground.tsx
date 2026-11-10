import { Redirect } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BarChart,
  Button,
  Card,
  Chip,
  DayPills,
  EmojiTile,
  Field,
  PasswordField,
  ProgressSteps,
  Ring,
  SkeletonChartCard,
  SkeletonHabitRow,
  SkeletonStatPair,
  SkeletonSummaryCard,
  Stepper,
  TabBar,
  type TabItem,
  Text,
} from "@/components/ui";
import { ThemeOverrideProvider, useTheme } from "@/lib/useTheme";
import { ACCENTS, type ThemeScheme } from "@/shared/tokens";

// Playground apenas para desenvolvimento: textos fixos são aceitáveis aqui (fora do app de produção).
const TABS: TabItem[] = [
  { key: "today", label: "Hoje", icon: "today" },
  { key: "progress", label: "Progresso", icon: "progress" },
  { key: "habits", label: "Hábitos", icon: "habits" },
  { key: "profile", label: "Perfil", icon: "profile" },
];
const DAY_LABELS = ["S", "T", "Q", "Q", "S", "S", "D"];
const WEEK = [0.4, 0.7, 0.55, 0.9, 0.8, 0.3, 0.6].map((value, i) => ({
  label: DAY_LABELS[i]!,
  value,
  highlight: i === 3,
}));

export default function Playground() {
  if (!__DEV__) return <Redirect href="/" />;
  return <PlaygroundScreen />;
}

function PlaygroundScreen() {
  const insets = useSafeAreaInsets();
  const [accent, setAccent] = useState<(typeof ACCENTS)[number]>(ACCENTS[0]);
  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40, gap: 28 }}
    >
      <View style={styles.pad}>
        <Text variant="screenTitle">Playground</Text>
        <Text tone="mute">Componentes base · claro e escuro · 7 cores de destaque</Text>
        <View style={styles.swatches}>
          {ACCENTS.map((c) => (
            <View
              key={c}
              accessibilityRole="button"
              accessibilityLabel={c}
              onTouchEnd={() => setAccent(c)}
              style={[styles.swatch, { backgroundColor: c }, c === accent && { borderWidth: 2, borderColor: "#888" }]}
            />
          ))}
        </View>
      </View>
      <Panel scheme="dark" accent={accent} />
      <Panel scheme="light" accent={accent} />
      <View style={styles.pad}>
        <Text variant="sectionTitle">Matriz: 7 cores × 2 modos</Text>
      </View>
      <Matrix scheme="dark" />
      <Matrix scheme="light" />
    </ScrollView>
  );
}

function Surface({
  scheme,
  accent,
  children,
}: {
  scheme: ThemeScheme;
  accent: (typeof ACCENTS)[number];
  children: React.ReactNode;
}) {
  return (
    <ThemeOverrideProvider scheme={scheme} accent={accent}>
      <SurfaceInner>{children}</SurfaceInner>
    </ThemeOverrideProvider>
  );
}

function SurfaceInner({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={[styles.surface, { backgroundColor: theme.bg }]}>{children}</View>;
}

function Panel({ scheme, accent }: { scheme: ThemeScheme; accent: (typeof ACCENTS)[number] }) {
  return (
    <Surface scheme={scheme} accent={accent}>
      <Showcase title={scheme === "dark" ? "Escuro" : "Claro"} />
    </Surface>
  );
}

function Showcase({ title }: { title: string }) {
  const [name, setName] = useState("Ana");
  const [password, setPassword] = useState("");
  const [days, setDays] = useState([0, 2, 4]);
  const [qty, setQty] = useState(2.5);
  const [chips, setChips] = useState<string[]>(["Água"]);
  const [tab, setTab] = useState("today");
  return (
    <View style={styles.stack}>
      <Text variant="sectionTitle">{title}</Text>

      <ProgressSteps current={2} accessibilityLabel="Etapa 2 de 3" />

      <View style={styles.row}>
        <Button label="Continuar" onPress={() => {}} style={styles.flex} />
        <Button label="Cancelar" variant="secondary" onPress={() => {}} style={styles.flex} />
      </View>
      <View style={styles.row}>
        <Button label="Desabilitado" disabled style={styles.flex} />
        <Button label="Carregando" loading style={styles.flex} />
      </View>

      <Text variant="label" tone="mute">
        Skeleton
      </Text>
      <SkeletonSummaryCard />
      <SkeletonHabitRow />
      <SkeletonChartCard height={90} />
      <SkeletonStatPair />

      <Field label="Nome" value={name} onChangeText={setName} />
      <Field label="E-mail" value="ana@" error="Informe um e-mail válido" keyboardType="email-address" />
      <PasswordField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        showLabel="Mostrar"
        hideLabel="Ocultar"
      />

      <View style={styles.wrap}>
        {["Água", "Meditar", "Ler", "Treinar"].map((c, i) => (
          <Chip
            key={c}
            label={c}
            emoji={["💧", "🧘", "📖", "🏃"][i]}
            selected={chips.includes(c)}
            onPress={() => setChips((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]))}
          />
        ))}
      </View>

      <Card radius={28} padding={20}>
        <View style={styles.row}>
          <Ring progress={0.6} accessibilityLabel="3 de 5 feitos">
            <Text variant="display" style={styles.ringNum}>
              3/5
            </Text>
            <Text variant="caption" tone="mute">
              feitos
            </Text>
          </Ring>
          <View style={styles.flex}>
            <Text variant="bodyMedium">Você já completou mais da metade.</Text>
            <Text variant="caption" tone="mute">
              Sequência de 12 dias
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.row}>
          <EmojiTile emoji="💧" size={36} />
          <Text variant="bodyStrong" style={styles.flex}>
            Beber água
          </Text>
          <Stepper
            value={`${qty.toString().replace(".", ",")} L`}
            onDecrement={() => setQty((q) => Math.max(0, q - 0.25))}
            onIncrement={() => setQty((q) => q + 0.25)}
            decrementLabel="Diminuir"
            incrementLabel="Aumentar"
          />
        </View>
        <View style={styles.gap}>
          <DayPills labels={DAY_LABELS} value={days} onChange={setDays} />
        </View>
      </Card>

      <View style={styles.row}>
        <EmojiTile emoji="📖" size={56} />
        <EmojiTile emoji="🏃" size={40} emojiOpacity={0.55} />
        <EmojiTile emoji="🧘" size={28} />
      </View>

      <Card radius={28} padding={20}>
        <BarChart data={WEEK} accessibilityLabel="Conclusão por dia da semana" />
      </Card>

      <View style={styles.tabPreview}>
        <TabBarPreview tab={tab} onSelect={setTab} />
      </View>
    </View>
  );
}

/** Barra de abas é `position: absolute`; aqui ela fica contida num contêiner de pré-visualização. */
function TabBarPreview({ tab, onSelect }: { tab: string; onSelect: (k: string) => void }) {
  return (
    <View style={styles.tabBox}>
      <TabBar items={TABS} activeKey={tab} onSelect={onSelect} />
    </View>
  );
}

function Matrix({ scheme }: { scheme: ThemeScheme }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matrixRow}>
      {ACCENTS.map((accent) => (
        <Surface key={accent} scheme={scheme} accent={accent}>
          <View style={styles.matrixCell}>
            <Button label="Botão" onPress={() => {}} />
            <Chip label="Chip" emoji="💧" selected />
            <Ring progress={0.7} size={64} strokeWidth={8} />
            <EmojiTile emoji="🧘" />
            <ProgressSteps current={2} />
            <DayPills labels={DAY_LABELS} value={[0, 3]} onChange={() => {}} />
          </View>
        </Surface>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 22, gap: 8 },
  swatches: { flexDirection: "row", gap: 10, marginTop: 8 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  surface: { marginHorizontal: 12, borderRadius: 28, padding: 22, overflow: "hidden" },
  stack: { gap: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  gap: { marginTop: 14 },
  ringNum: { fontSize: 30, lineHeight: 33 },
  tabPreview: { height: 110 },
  tabBox: { flex: 1, position: "relative" },
  matrixRow: { gap: 12, paddingHorizontal: 12 },
  matrixCell: { width: 150, gap: 14, alignItems: "stretch" },
});
