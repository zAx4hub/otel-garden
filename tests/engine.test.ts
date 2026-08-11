import { describe, it, expect } from "vitest";
import { rank, run, demo, similarity, inspect } from "../src/engine";

describe("otel-garden", () => {
  it("ranks deterministically", () => {
    expect(rank("hello zax world", 7)).toBe(rank("hello zax world", 7));
    expect(rank("", 1)).toBe(0);
  });
  it("similarity bounds", () => {
    expect(similarity("a b", "a b")).toBe(1);
    expect(similarity("a", "z")).toBe(0);
  });
  it("run produces findings", () => {
    const r = run({ items: [{ text: "alpha" }, { text: "beta gamma" }], threshold: 0.01 });
    expect(r.author).toContain("zAx4hub");
    expect(r.project).toBe("otel-garden");
    expect(r.findings).toHaveLength(2);
    expect(r.metrics.count).toBe(2);
  });
  it("demo + inspect", () => {
    expect(demo().score).toBeGreaterThanOrEqual(0);
    expect(inspect().name).toBe("otel-garden");
  });
});
