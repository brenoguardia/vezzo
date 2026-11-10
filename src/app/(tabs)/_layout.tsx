import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { TabBar, type TabItem } from "@/components/ui";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";

type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

type TabKey = "home" | "progress" | "habits" | "profile";

function FloatingTabBar({ state, navigateToTab }: BottomTabBarProps) {
  const t = useT();
  const items: TabItem[] = [
    { key: "home", label: t("tabs.today"), icon: "today" },
    { key: "progress", label: t("tabs.progress"), icon: "progress" },
    { key: "habits", label: t("tabs.habits"), icon: "habits" },
    { key: "profile", label: t("tabs.profile"), icon: "profile" },
  ];
  const activeKey: TabKey = (state.routes[state.index]?.name as TabKey | undefined) ?? "home";
  return (
    <TabBar
      items={items}
      activeKey={activeKey}
      onSelect={(key) => navigateToTab(state.routes.find((r) => r.name === key)?.key ?? key)}
    />
  );
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
    </Tabs>
  );
}
