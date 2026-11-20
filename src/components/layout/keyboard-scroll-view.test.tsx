import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";
import { KeyboardScrollView } from "./KeyboardScrollView";

describe("KeyboardScrollView", () => {
  it("renderiza o conteúdo dentro do scroll ciente do teclado", async () => {
    await render(
      <KeyboardScrollView>
        <Text>campo</Text>
      </KeyboardScrollView>,
    );
    expect(screen.getByText("campo")).toBeTruthy();
  });
});
