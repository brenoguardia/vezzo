import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "@jest/globals";

/**
 * Com o React Compiler, `t()` importado de `@/i18n` é tratado como puro e fica memorizado no
 * primeiro idioma: assinar `useLocale()` não basta. Componentes precisam de `const t = useT()`,
 * cuja identidade muda com o idioma e invalida a memoização.
 */
function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") && !path.endsWith(".test.tsx") ? [path] : [];
  });
}

const sources = () =>
  tsxFiles(join(process.cwd(), "src")).map((file) => ({
    file: file.replace(`${process.cwd()}/`, ""),
    source: readFileSync(file, "utf8"),
  }));

describe("i18n reativo", () => {
  it("todo .tsx que chama t() usa const t = useT()", () => {
    const offenders = sources().filter(
      ({ source }) => /(?<![\w.])t\(/.test(source) && !/const t = useT\(\)/.test(source),
    );
    expect(offenders.map((o) => o.file)).toEqual([]);
  });

  it("nenhum .tsx importa t de @/i18n (seria não reativo)", () => {
    const offenders = sources().filter(({ source }) => /import \{[^}]*\bt\b[^}]*\} from "@\/i18n";/.test(source));
    expect(offenders.map((o) => o.file)).toEqual([]);
  });
});
