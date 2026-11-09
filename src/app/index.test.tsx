import { expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import Index from "./index";

it("renderiza a tela inicial", async () => {
  await render(<Index />);
  expect(screen.toJSON()).toBeTruthy();
});
