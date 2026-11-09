import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Easing, ReduceMotion, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "@/lib/useTheme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** 0–1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Conteúdo central (ex.: "3/5"). */
  children?: React.ReactNode;
  accessibilityLabel?: string;
}

export function Ring({ progress, size = 112, strokeWidth = 11, children, accessibilityLabel }: Props) {
  const theme = useTheme();
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const value = useSharedValue(clamped);

  useEffect(() => {
    value.value = withTiming(clamped, {
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      reduceMotion: ReduceMotion.System,
    });
  }, [clamped, value]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - value.value),
  }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} style={styles.svg}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.line} strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={theme.acc}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: { position: "absolute", transform: [{ rotate: "-90deg" }] },
  center: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
});
