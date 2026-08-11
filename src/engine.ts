/** otel-garden — engine by zAx4hub (algo flavor: rolling-hash) */
export type Item = { id?: string; text: string; weight?: number };
export type Report = {
  project: string;
  author: string;
  algo: string;
  summary: string;
  score: number;
  findings: Array<{ id: string; text: string; score: number; tag: string }>;
  metrics: Record<string, number>;
};

function tokens(s: string): string[] {
  return s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function hash32(s: string, seed = 0): number {
  let h = 2166136261 ^ seed;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function similarity(a: string, b: string): number {
  const A = new Set(tokens(a));
  const B = new Set(tokens(b));
  if (!A.size && !B.size) return 1;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

export function rank(text: string, seed = 66): number {
  const toks = tokens(text);
  if (!toks.length) return 0;
  const uniq = new Set(toks).size / toks.length;
  const rolling = toks.reduce((acc, t, i) => acc + (hash32(t, seed + i) % 1000) / 1000, 0) / toks.length;
  const lengthBias = Math.min(1, toks.length / 12);
  let score = 0.4 * uniq + 0.4 * rolling + 0.2 * lengthBias;
  if ("rolling-hash" === "topk") score = Math.min(1, score * 1.05);
  if ("rolling-hash" === "bloom") score = Math.min(1, score * 0.98 + 0.02);
  return Math.round(score * 1000) / 1000;
}

export function run(input: { items?: Item[]; threshold?: number; baseline?: string; seed?: number } = {}): Report {
  const items = input.items?.length ? input.items : [{ text: "otel-garden" }];
  const threshold = input.threshold ?? 0.35;
  const seed = input.seed ?? 66;
  const baseline = input.baseline ?? "";
  const findings = items.map((it, i) => {
    const base = rank(it.text, seed + i) * (it.weight ?? 1);
    const sim = baseline ? similarity(it.text, baseline) : 0;
    const score = Math.round(Math.min(1, base * 0.85 + sim * 0.15) * 1000) / 1000;
    return {
      id: it.id ?? `item-${i + 1}`,
      text: it.text,
      score,
      tag: score >= threshold ? "pass" : "review",
    };
  });
  const avg = findings.reduce((a, f) => a + f.score, 0) / findings.length;
  return {
    project: "otel-garden",
    author: "zAx4hub",
    algo: "rolling-hash",
    summary: `Processed ${findings.length} items for otel-garden; avg=${avg.toFixed(3)}`,
    score: Math.round(avg * 1000) / 1000,
    findings,
    metrics: {
      count: findings.length,
      threshold,
      passed: findings.filter((f) => f.tag === "pass").length,
      id: 66,
    },
  };
}

export function demo(): Report {
  return run({
    items: [
      { text: "Opinionated OTel demo + SDKs" },
      { text: "zAx4hub quality gate regression fixture" },
      { text: "deterministic rolling-hash scoring path" },
    ],
    threshold: 0.2,
    baseline: "zAx4hub open source",
  });
}

export function inspect() {
  return {
    name: "otel-garden",
    author: "zAx4hub",
    oneLiner: "Opinionated OTel demo + SDKs",
    algo: "rolling-hash",
    version: "0.1.0",
    commands: ["demo", "run", "inspect"],
  };
}
