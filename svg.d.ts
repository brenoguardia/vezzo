declare module "*.svg" {
  import type { FC } from "react";
  import type { SvgProps } from "react-native-svg";

  /** `acc` e `ink` substituem as cores do arquivo (ver `.svgrrc`). */
  const content: FC<SvgProps & { acc?: string; ink?: string }>;
  export default content;
}
