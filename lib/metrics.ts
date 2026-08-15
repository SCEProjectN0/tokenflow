import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type RequestMetric = {
  id: string;
  provider: string;
  model: string;
  createdAt: string;
  originalTokens: number;
  optimizedTokens: number;
  outputTokens: number;
  latencyMs: number;
  savedTokens: number;
  percentageSaved: number;
  cacheHitRatio: number;
  estimatedCostSaved: number;
  budgetLimit: number;
  summary: string;
};

const metricsPath = path.join(process.cwd(), "data", "metrics.json");

async function readMetrics(): Promise<RequestMetric[]> {
  try {
    const raw = await readFile(metricsPath, "utf8");
    const data = JSON.parse(raw) as RequestMetric[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeMetrics(entries: RequestMetric[]) {
  await mkdir(path.dirname(metricsPath), { recursive: true });
  await writeFile(metricsPath, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
}

export async function recordOptimizationMetric(metric: Omit<RequestMetric, "id" | "createdAt"> & { id?: string }) {
  const entries = await readMetrics();
  const record: RequestMetric = {
    id: metric.id || crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    provider: metric.provider,
    model: metric.model,
    originalTokens: Number(metric.originalTokens) || 0,
    optimizedTokens: Number(metric.optimizedTokens) || 0,
    outputTokens: Number(metric.outputTokens) || 0,
    latencyMs: Number(metric.latencyMs) || 0,
    savedTokens: Number(metric.savedTokens) || 0,
    percentageSaved: Number(metric.percentageSaved) || 0,
    cacheHitRatio: Number(metric.cacheHitRatio) || 0,
    estimatedCostSaved: Number(metric.estimatedCostSaved) || 0,
    budgetLimit: Number(metric.budgetLimit) || 0,
    summary: metric.summary || "Request optimized.",
  };

  const next = [record, ...entries].slice(0, 50);
  await writeMetrics(next);
  return record;
}

export async function getMetricSummary() {
  const entries = await readMetrics();

  if (!entries.length) {
    return {
      totalRequests: 0,
      totalSavedTokens: 0,
      averageReduction: 0,
      averageLatencyMs: 0,
      estimatedCostSaved: 0,
      cacheHitRatio: 0,
      recent: [],
    };
  }

  const totalSavedTokens = entries.reduce((sum, item) => sum + (item.savedTokens || 0), 0);
  const averageReduction = entries.reduce((sum, item) => sum + (item.percentageSaved || 0), 0) / entries.length;
  const averageLatencyMs = entries.reduce((sum, item) => sum + (item.latencyMs || 0), 0) / entries.length;
  const estimatedCostSaved = entries.reduce((sum, item) => sum + (item.estimatedCostSaved || 0), 0);
  const cacheHitRatio = entries.reduce((sum, item) => sum + (item.cacheHitRatio || 0), 0) / entries.length;

  return {
    totalRequests: entries.length,
    totalSavedTokens,
    averageReduction,
    averageLatencyMs,
    estimatedCostSaved,
    cacheHitRatio,
    recent: entries.slice(0, 10),
  };
}
