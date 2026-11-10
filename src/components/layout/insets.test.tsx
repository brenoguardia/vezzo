import { describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { TabBar } from "@/components/ui";
import { SettingsShell } from "@/features/profile/SettingsShell";

// iPhone Duo fechado: o rail vertical vira 84 pt de inset à direita.
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 34, left: 0, right: 84 }),
}));
jest.mock("expo-router", () => ({ useRouter: () => ({ canGoBack: () => true, back: jest.fn(), replace: jest.fn() }) }));

const flat = (style: unknown): Record<string, number | string> =>
  Object.assign({}, ...(Array.isArray(style) ? style.map(flat) : [style ?? {}]));

describe("rail do dobrável (insets laterais)", () => {
  it("SettingsShell mantém o conteúdo fora do rail (padding no conteúdo, não no scroll)", async () => {
    await render(<SettingsShell>{null}</SettingsShell>);
    const scroll = screen.getByTestId("settings-scroll");
    expect(flat(scroll.props.contentContainerStyle)).toMatchObject({ paddingRight: 84, paddingLeft: 0 });
    expect(flat(scroll.props.style).paddingRight).toBeUndefined();
  });

  it("a barra de abas flutuante não passa sob o rail", async () => {
    await render(
      <TabBar
        items={[
          { key: "home", label: "Hoje", icon: "today" },
          { key: "profile", label: "Perfil", icon: "profile" },
        ]}
        activeKey="home"
        onSelect={() => {}}
      />,
    );
    const wrap = screen.getByTestId("tab-bar");
    expect(flat(wrap.props.style)).toMatchObject({ left: 16, right: 100 });
  });
});
