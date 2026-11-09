const { defineConfig, globalIgnores } = require("eslint/config");
const expo = require("eslint-config-expo/flat");

const serverOnly = ["@prisma/client", "resend", "better-auth"];

module.exports = defineConfig([
  globalIgnores(["dist/*", ".expo/*", "node_modules/*"]),
  expo,
  {
    // Fronteira cliente/servidor (CLAUDE.md regra 5)
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: serverOnly.map((name) => ({
            name,
            message: "Só pode ser importado em +api.ts e src/server/**.",
          })),
          patterns: [
            {
              // `better-auth/react` e `@better-auth/expo/client` são o cliente (src/auth); o resto é servidor.
              group: ["better-auth/*", "!better-auth/react"],
              message: "Só pode ser importado em +api.ts e src/server/**.",
            },
            {
              group: ["@/server", "@/server/*", "**/server/*", "**/server"],
              message: "src/server só pode ser importado em +api.ts e src/server/**.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*+api.ts", "src/server/**"],
    rules: { "no-restricted-imports": "off" },
  },
]);
