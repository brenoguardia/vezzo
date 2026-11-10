import { describe, expect, it } from "vitest";
import { EMOJI_PRESETS, isSingleEmoji, lastEmoji } from "./emoji";

describe("isSingleEmoji", () => {
  it.each(["💧", "🏋️", "👨‍👩‍👧", "🇧🇷"])("aceita %s", (value) => {
    expect(isSingleEmoji(value)).toBe(true);
  });
  it.each(["", "a", "1", "💧💧", "💧a"])("rejeita %j", (value) => {
    expect(isSingleEmoji(value)).toBe(false);
  });
});

describe("lastEmoji", () => {
  it("pega o último emoji digitado", () => {
    expect(lastEmoji("🎯🌿")).toBe("🌿");
    expect(lastEmoji("a🎯")).toBe("🎯");
  });
  it("ignora texto sem emoji", () => {
    expect(lastEmoji("abc")).toBeNull();
    expect(lastEmoji("")).toBeNull();
  });
  it("presets são emojis únicos válidos", () => {
    expect(EMOJI_PRESETS.every((e) => isSingleEmoji(e))).toBe(true);
  });
});
