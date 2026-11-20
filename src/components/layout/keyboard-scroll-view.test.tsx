import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardScrollView } from "./KeyboardScrollView";

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe("KeyboardScrollView", () => {
  it("renderiza o conteúdo dentro do scroll ciente do teclado", async () => {
    await render(
      <SafeAreaProvider initialMetrics={METRICS}>
        <KeyboardScrollView>
          <Text>campo</Text>
        </KeyboardScrollView>
      </SafeAreaProvider>,
    );
    expect(screen.getByText("campo")).toBeTruthy();
  });
});
