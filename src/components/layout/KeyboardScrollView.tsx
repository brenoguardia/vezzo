import {
  KeyboardAwareScrollView,
  type KeyboardAwareScrollViewProps,
} from "react-native-keyboard-controller";

import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Folga entre o campo focado e o teclado (o rótulo e o erro do `Field` cabem acima do teclado). */
const MAX_EXTRA_OFFSET = 20;
const KEYBOARD_BOTTOM_OFFSET = 48 + MAX_EXTRA_OFFSET;

/**
 * Único ScrollView das telas com campos de texto. Rola até o campo focado e abre espaço no fim do
 * conteúdo quando o teclado aparece, em iOS e Android (edge-to-edge). Substitui `KeyboardAvoidingView`
 * (docs do Expo: guides/keyboard-handling). Requer `KeyboardProvider` na raiz (`src/app/_layout.tsx`).
 */
export function KeyboardScrollView(props: KeyboardAwareScrollViewProps) {
  const insets = useSafeAreaInsets();
  const keyboardOffSet = Math.max(
    insets.bottom + MAX_EXTRA_OFFSET,
    KEYBOARD_BOTTOM_OFFSET,
  );

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
