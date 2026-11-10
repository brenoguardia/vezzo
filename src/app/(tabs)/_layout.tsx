import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { t } from "@/i18n";
import { useLocale } from "@/i18n/useLocale";
import { useTheme } from "@/lib/useTheme";

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const ROUTES = ["home", "progress", "habits", "profile"] as const;
type TabKey = (typeof ROUTES)[number];

function FloatingTabBar({ state, navigateToTab }: BottomTabBarProps) {
  useLocale();
  const items: TabItem[] = [
    { key: "home", label: t("tabs.today"), icon: "circle" },
    { key: "progress", label: t("tabs.progress"), icon: "square" },
    { key: "habits", label: t("tabs.habits"), icon: "rounded" },
    { key: "profile", label: t("tabs.profile"), icon: "tab" },
  ];
  const current = state.routes[state.index]?.name ?? "home";
  // Telas auxiliares (tema, excluir conta) pertencem ao Perfil.
  const activeKey: TabKey = (ROUTES as readonly string[]).includes(current) ? (current as TabKey) : "profile";
  return <TabBar items={items} activeKey={activeKey} onSelect={(key) => navigateToTab(state.routes.find((r) => r.name === key)?.key ?? key)} />;
}

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.bg } }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="progress" />
      <Tabs.Screen name="habits" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="theme" options={{ href: null }} />
      <Tabs.Screen name="delete-account" options={{ href: null }} />
      <Tabs.Screen name="notifications-debug" options={{ href: null }} />
    </Tabs>
  );
}
