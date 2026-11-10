import Icon from "@/assets/images/icon.svg";
import { useTheme } from "@/lib/useTheme";

/** Marca (`assets/images/icon.svg`): fundo na cor de destaque e V-check em `accInk`. */
export function BrandMark({ size = 112 }: { size?: number }) {
  const theme = useTheme();
  return (
    <Icon
      width={size}
      height={size}
      acc={theme.acc}
      ink={theme.accInk}
      accessibilityRole="image"
      accessibilityLabel="Vezzo"
    />
  );
}
