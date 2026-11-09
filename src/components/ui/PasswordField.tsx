import { forwardRef, useState } from "react";
import { Field, FieldAction, type FieldInput, type FieldProps } from "./Field";

interface Props extends Omit<FieldProps, "right" | "secureTextEntry"> {
  showLabel: string;
  hideLabel: string;
}

export const PasswordField = forwardRef<FieldInput, Props>(function PasswordField(
  { showLabel, hideLabel, ...field },
  ref,
) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      ref={ref}
      autoCapitalize="none"
      autoCorrect={false}
      {...field}
      secureTextEntry={!visible}
      right={<FieldAction label={visible ? hideLabel : showLabel} onPress={() => setVisible((v) => !v)} />}
    />
  );
});
