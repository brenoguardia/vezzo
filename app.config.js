const { withEntitlementsPlist } = require("expo/config-plugins");

const APPLE_SIGN_IN = "com.apple.developer.applesignin";

/**
 * Complementa o `app.json`. O Sign in with Apple exige entitlement e, portanto, certificado de
 * assinatura (conta Apple Developer paga), até para rodar no simulador. O plugin do
 * `expo-apple-authentication` o adiciona sempre; aqui removemos, a menos que `APPLE_SIGN_IN=1`
 * esteja definido ao gerar o projeto nativo (prebuild/EAS) numa conta paga.
 */
module.exports = ({ config }) => {
  const enabled = process.env.APPLE_SIGN_IN === "1";
  const next = { ...config, ios: { ...config.ios, usesAppleSignIn: enabled } };
  if (enabled) return next;
  return withEntitlementsPlist(next, (c) => {
    delete c.modResults[APPLE_SIGN_IN];
    return c;
  });
};
