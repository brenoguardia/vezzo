import { KeyboardAwareScrollView, type KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";

import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Folga entre o campo focado e o teclado: cobre o erro do `Field` e a linha de botões logo abaixo
 * dele (Cancelar/Salvar do composer de anotação, ~65 dp). Na base da tela soma a safe area.
 */
const KEYBOARD_BOTTOM_OFFSET = 112;
const SAFE_AREA_EXTRA = 20;

/**
 * Único ScrollView das telas com campos de texto. Rola até o campo focado e abre espaço no fim do
 * conteúdo quando o teclado aparece, em iOS e Android (edge-to-edge). Nas telas com botão ancorado ao
 * fim (auth, onboarding, ajustes), a casca envolve este scroll em `KeyboardAvoidingView` da mesma
 * biblioteca, para o rodapé ficar acima do teclado. Requer `KeyboardProvider` na raiz (`src/app/_layout.tsx`).
 * Docs do Expo: guides/keyboard-handling.
 */
export function KeyboardScrollView(props: KeyboardAwareScrollViewProps) {
  const insets = useSafeAreaInsets();
  const keyboardOffSet = Math.max(insets.bottom + SAFE_AREA_EXTRA, KEYBOARD_BOTTOM_OFFSET);

  return (
    <KeyboardAwareScrollView
      bottomOffset={keyboardOffSet}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}
