jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Mock mínimo do Reanimated: os testes cobrem estrutura e acessibilidade, não animação.
jest.mock("react-native-reanimated", () => ({
  __esModule: true,
  default: { createAnimatedComponent: (component) => component },
  Easing: { inOut: (fn) => fn, ease: (t) => t },
  ReduceMotion: { System: "system" },
  useSharedValue: (initial) => ({ value: initial }),
  useAnimatedProps: (factory) => factory(),
  withTiming: (value) => value,
}));
