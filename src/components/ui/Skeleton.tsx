import { type ReactNode, useEffect } from "react";
import { type DimensionValue, type StyleProp, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useT } from "@/i18n/useT";
import { useTheme } from "@/lib/useTheme";

interface BlockProps {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bloco cinza pulsante: o único tipo de loading de conteúdo do app. Decorativo; use dentro de
 * `SkeletonGroup`, que dá o rótulo "Carregando" ao leitor de tela. O pulso respeita "reduzir movimento".
 */
export function Skeleton({ width = "100%", height, radius = 8, style }: BlockProps) {
  const theme = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.45, { duration: 900, easing: Easing.inOut(Easing.ease), reduceMotion: ReduceMotion.System }),
      -1,
      true,
    );
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor: theme.line }, style, animated]} />
  );
}

interface GroupProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/** Região de carregamento: um único item "Carregando" para o leitor de tela; os blocos ficam mudos. */
export function SkeletonGroup({ children, style, testID }: GroupProps) {
  const t = useT();
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={t("common.loading")}
      accessibilityLiveRegion="polite"
      style={style}
    >
      {children}
    </View>
  );
}
