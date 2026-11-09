import { expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import Today from "@/app/(tabs)/index";

// O client do Better Auth é ESM e não é necessário para renderizar a tela.
jest.mock("@/auth/client", () => ({ authClient: {} }));

it("renderiza a tela inicial", async () => {
  await render(<Today />);
  expect(screen.toJSON()).toBeTruthy();
});
