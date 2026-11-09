import { describe, expect, it } from "vitest";
import { isSingleEmoji } from "./emoji";

describe("isSingleEmoji", () => {
  it.each(["💧", "🏋️", "👨‍👩‍👧", "🇧🇷"])("aceita %s", (value) => {
    expect(isSingleEmoji(value)).toBe(true);
  });
  it.each(["", "a", "1", "💧💧", "💧a"])("rejeita %j", (value) => {
    expect(isSingleEmoji(value)).toBe(false);
  });
});
