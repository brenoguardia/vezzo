import { KeyboardAwareScrollView, type KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";

/** Folga entre o campo focado e o teclado (o rótulo e o erro do `Field` cabem acima do teclado). */
const KEYBOARD_BOTTOM_OFFSET = 48;

/**
 * Único ScrollView das telas com campos de texto. Rola até o campo focado e abre espaço no fim do
 * conteúdo quando o teclado aparece, em iOS e Android (edge-to-edge). Substitui `KeyboardAvoidingView`
 * (docs do Expo: guides/keyboard-handling). Requer `KeyboardProvider` na raiz (`src/app/_layout.tsx`).
 */
export function KeyboardScrollView(props: KeyboardAwareScrollViewProps) {
  return (
    <KeyboardAwareScrollView
      bottomOffset={KEYBOARD_BOTTOM_OFFSET}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
      {...props}
    />
  );
}
