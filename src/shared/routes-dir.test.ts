import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * O Expo Router trata TODO arquivo de `src/app/` como rota e o empacota no app. Um `*.test.tsx` ali
 * puxa o jest/testing-library para o bundle e quebra o build de release (e os testes e o CI continuam
 * verdes). Testes das rotas ficam fora de `src/app/` e importam a tela por `@/app/...`.
 */
describe("src/app só tem rotas", () => {
  it("não há arquivos de teste dentro de src/app", () => {
    const root = join(process.cwd(), "src/app");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(test|spec)\.[cm]?[jt]sx?$/.test(name) || full.includes("__tests__"))
          offenders.push(relative(process.cwd(), full));
      }
    };
    walk(root);
    expect(offenders).toEqual([]);
  });
});
