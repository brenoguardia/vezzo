import { useRouter } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SplitView } from "@/components/layout";
import { Text } from "@/components/ui";
import { t } from "@/i18n";
import { useLayoutMode } from "@/lib/useLayoutMode";
import { useTheme } from "@/lib/useTheme";
import { layout } from "@/shared/tokens";

interface Props {
  /** Sem título, a tela renderiza só o conteúdo (o perfil tem cabeçalho próprio). */
  title?: string;
  back?: boolean;
  children: ReactNode;
  /** Ancorado ao fim da tela (botão primário a 56 do fim, docs/05). */
  footer?: ReactNode;
  /** Painel da direita no modo dual (lista + detalhe, docs/08). No modo single não é renderizado. */
  aside?: ReactNode;
  /** `false` quando o painel já rola sozinho (formulário). */
  asideScrolls?: boolean;
}

/** Casca das telas de tema/perfil/excluir conta: margem 22, safe area e largura máxima em telas largas. */
export function SettingsShell({ title, back, children, footer, aside, asideScrolls }: Props) {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { dual, width } = useLayoutMode();

  const header = (
    <>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
          hitSlop={8}
          style={styles.back}
        >
          <Text variant="bodyMedium" tone="mute" style={styles.backText}>
            ‹ {t("common.back")}
          </Text>
        </Pressable>
      ) : null}
      {title ? (
        <Text variant="screenTitle" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      ) : null}
    </>
  );

  if (dual && aside) {
    return (
      <SplitView
        left={
          <>
            {header}
            <View style={styles.paneBody}>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </>
        }
        right={aside}
        rightScrolls={asideScrolls}
      />
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: Math.max(22, insets.bottom) + layout.tabBarHeight + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ width: Math.min(width, layout.formMaxWidth), paddingHorizontal: layout.screenMargin, flexGrow: 1 }}>
        {header}
        <View style={styles.body}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: "center" },
  back: { minHeight: layout.minTouch, justifyContent: "center", alignSelf: "flex-start" },
  backText: { fontWeight: "700" },
  title: { marginTop: 8 },
  body: { marginTop: 20, gap: 14 },
  paneBody: { gap: 14 },
  footer: { marginTop: "auto", paddingTop: 32, gap: 14 },
});
