import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/useTheme";
import { layout, radius } from "@/shared/tokens";
import { Card } from "./Card";
import { Skeleton, SkeletonGroup } from "./Skeleton";

/*
 * Composições de skeleton. Cada uma espelha o tamanho do conteúdo real (alturas, raios, margens)
 * para a tela não "pular" quando os dados chegam. Todas usam `SkeletonGroup` (rótulo "Carregando").
 */

/** Linha de hábito: tile de emoji, nome, subtítulo e círculo de check (igual a `HabitRow`). */
export function SkeletonHabitRow() {
  return (
    <Card radius={radius.card} padding={0} style={styles.habitRow}>
      <Skeleton width={40} height={40} radius={14} />
      <View style={styles.flex}>
        <Skeleton width="55%" height={15} radius={6} />
        <Skeleton width="35%" height={12} radius={6} style={styles.gap2} />
      </View>
      <Skeleton width={28} height={28} radius={14} />
    </Card>
  );
}

/** Cartão de resumo do dia: anel de 112 e duas linhas de texto. */
export function SkeletonSummaryCard() {
  return (
    <Card radius={radius.cardHero} padding={20} style={styles.summary}>
      <Skeleton width={112} height={112} radius={56} />
      <View style={styles.flex}>
        <Skeleton width="90%" height={18} radius={6} />
        <Skeleton width="60%" height={18} radius={6} style={styles.gap8} />
        <Skeleton width="45%" height={13} radius={6} style={styles.gap12} />
      </View>
    </Card>
  );
}

const BAR_HEIGHTS = [0.4, 0.75, 0.55, 0.9, 0.3, 0.6, 0.45];

/** Cartão do gráfico semanal (7 barras) com rótulo e porcentagem. */
export function SkeletonChartCard({ height = 140 }: { height?: number }) {
  return (
    <Card radius={radius.cardHero} padding={20} style={styles.chartCard}>
      <Skeleton width={90} height={14} radius={6} />
      <Skeleton width={80} height={36} radius={8} />
      <View style={[styles.bars, { height }]}>
        {BAR_HEIGHTS.map((ratio, i) => (
          <Skeleton key={i} width="11%" height={Math.round(height * ratio)} radius={8} />
        ))}
      </View>
    </Card>
  );
}

/** Dois cartões pequenos lado a lado (melhor dia, sequência). */
export function SkeletonStatPair() {
  return (
    <View style={styles.pair}>
      {[0, 1].map((i) => (
        <Card key={i} radius={radius.card} padding={16} style={styles.flex}>
          <Skeleton width="50%" height={12} radius={6} />
          <Skeleton width="70%" height={20} radius={6} style={styles.gap8} />
        </Card>
      ))}
    </View>
  );
}

/** Hoje: resumo + 3 linhas. */
export function TodaySkeleton() {
  return (
    <SkeletonGroup testID="skeleton-today" style={styles.list}>
      <SkeletonSummaryCard />
      {[0, 1, 2].map((i) => (
        <SkeletonHabitRow key={i} />
      ))}
    </SkeletonGroup>
  );
}

/** Hábitos: lista de linhas. */
export function HabitsListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <SkeletonGroup testID="skeleton-habits" style={styles.list}>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonHabitRow key={i} />
      ))}
    </SkeletonGroup>
  );
}

/** Progresso: gráfico semanal + dois cartões. */
export function ProgressSkeleton() {
  return (
    <SkeletonGroup testID="skeleton-progress" style={styles.list}>
      <SkeletonChartCard />
      <SkeletonStatPair />
    </SkeletonGroup>
  );
}

/** Gráfico de mês/ano dentro do cartão de Progresso (barras ou células). */
export function ChartAreaSkeleton({ height = 140 }: { height?: number }) {
  return (
    <SkeletonGroup testID="skeleton-chart">
      <View style={[styles.bars, { height }]}>
        {BAR_HEIGHTS.map((ratio, i) => (
          <Skeleton key={i} width="11%" height={Math.round(height * ratio)} radius={8} />
        ))}
      </View>
    </SkeletonGroup>
  );
}

/** Perfil: avatar, nome, "usando desde", 3 estatísticas e dois cartões de linhas. */
export function ProfileSkeleton() {
  return (
    <SkeletonGroup testID="skeleton-profile" style={styles.profile}>
      <Skeleton width={84} height={84} radius={42} />
      <Skeleton width={180} height={24} radius={8} />
      <Skeleton width={140} height={13} radius={6} />
      <View style={styles.pair}>
        {[0, 1, 2].map((i) => (
          <Card key={i} radius={radius.card} padding={16} style={styles.stat}>
            <Skeleton width={36} height={22} radius={6} />
            <Skeleton width="70%" height={12} radius={6} />
          </Card>
        ))}
      </View>
      {[3, 2].map((rows) => (
        <Card key={rows} radius={radius.cardLarge} padding={0} style={styles.fullWidth}>
          {Array.from({ length: rows }, (_, i) => (
            <View key={i} style={styles.settingRow}>
              <Skeleton width="35%" height={16} radius={6} />
              <Skeleton width="20%" height={14} radius={6} />
            </View>
          ))}
        </Card>
      ))}
    </SkeletonGroup>
  );
}

/** Linha de configurações cuja existência ainda é desconhecida (ex.: "Redefinir senha"). */
export function SkeletonSettingRow() {
  return (
    <SkeletonGroup testID="skeleton-setting-row" style={styles.settingRow}>
      <Skeleton width="40%" height={16} radius={6} />
    </SkeletonGroup>
  );
}

/** Detalhe do hábito: título, cartão de progresso, grade de 4 semanas e dois cartões. */
export function HabitDetailSkeleton() {
  return (
    <SkeletonGroup testID="skeleton-detail" style={styles.list}>
      <View style={styles.titleRow}>
        <Skeleton width={56} height={56} radius={20} />
        <View style={styles.flex}>
          <Skeleton width="60%" height={26} radius={8} />
          <Skeleton width="30%" height={13} radius={6} style={styles.gap8} />
        </View>
      </View>
      <Card radius={radius.cardHero} padding={22} style={styles.chartCard}>
        <Skeleton width="60%" height={40} radius={8} />
        <Skeleton width="100%" height={10} radius={5} />
        <View style={styles.pair}>
          <Skeleton width="48%" height={52} radius={radius.button} />
          <Skeleton width="48%" height={52} radius={radius.button} />
        </View>
      </Card>
      {[0, 1, 2, 3].map((row) => (
        <View key={row} style={styles.gridRow}>
          {Array.from({ length: 7 }, (_, i) => (
            <Skeleton key={i} width="12.5%" height={40} radius={8} />
          ))}
        </View>
      ))}
    </SkeletonGroup>
  );
}

/** Sequência: número grande e cartão da semana. */
export function StreakSkeleton() {
  return (
    <SkeletonGroup testID="skeleton-streak" style={styles.list}>
      <Skeleton width={140} height={96} radius={12} />
      <Skeleton width={120} height={18} radius={6} />
      <Card radius={radius.cardHero} padding={20} style={styles.gridRow}>
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} width={32} height={32} radius={16} />
        ))}
      </Card>
    </SkeletonGroup>
  );
}

/** Campo de formulário (senha, nome): altura de um `Field`. */
export function FieldSkeleton() {
  return (
    <SkeletonGroup testID="skeleton-field">
      <Skeleton height={64} radius={radius.field} />
    </SkeletonGroup>
  );
}

/** Formulário de hábito (editar): barra de ações, nome, emoji e frequência. */
export function HabitFormSkeleton() {
  return (
    <SkeletonGroup testID="skeleton-form" style={styles.form}>
      <View style={styles.formBar}>
        <Skeleton width={88} height={44} radius={radius.button} />
        <Skeleton width={110} height={18} radius={6} />
        <Skeleton width={88} height={44} radius={radius.button} />
      </View>
      <Skeleton height={64} radius={radius.field} />
      <View style={styles.gridRow}>
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} width={48} height={48} radius={14} />
        ))}
      </View>
      <View style={styles.gridRow}>
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} width="12%" height={44} radius={radius.pill} />
        ))}
      </View>
    </SkeletonGroup>
  );
}

/** Abertura do app: casca neutra (título, resumo, linhas e barra de abas) enquanto o gate resolve. */
export function AppShellSkeleton() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      testID="skeleton-app"
      style={[
        styles.shell,
        {
          backgroundColor: theme.bg,
          paddingTop: insets.top + 16,
          paddingLeft: 22 + insets.left,
          paddingRight: 22 + insets.right,
        },
      ]}
    >
      <SkeletonGroup style={styles.list}>
        <Skeleton width={70} height={14} radius={6} />
        <Skeleton width={220} height={30} radius={8} />
        <SkeletonSummaryCard />
        {[0, 1, 2].map((i) => (
          <SkeletonHabitRow key={i} />
        ))}
      </SkeletonGroup>
      <View
        style={[
          styles.tabBar,
          { bottom: Math.max(22, insets.bottom), left: 16 + insets.left, right: 16 + insets.right },
        ]}
      >
        <Skeleton height={layout.tabBarHeight} radius={radius.tabBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap2: { marginTop: 2 },
  gap8: { marginTop: 8 },
  gap12: { marginTop: 12 },
  list: { gap: 10 },
  habitRow: { flexDirection: "row", alignItems: "center", gap: 14, minHeight: 66, paddingHorizontal: 16 },
  summary: { flexDirection: "row", alignItems: "center", gap: 20 },
  chartCard: { gap: 12 },
  bars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  pair: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, alignItems: "center", gap: 8 },
  profile: { alignItems: "center", gap: 10 },
  fullWidth: { alignSelf: "stretch" },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 18 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  gridRow: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  form: { gap: 18 },
  formBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  shell: { flex: 1, gap: 14 },
  tabBar: { position: "absolute" },
});
