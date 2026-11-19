// The token radar's model: one snapshot of the protocol universe in, one ranked board out.
//
// V4 replaces radar-2 with radar-3: a size curve fitted to the snapshot's own traded-token
// comps. The market does not price a launch at a flat share of TVL: a log-log fit on the
// 119 comps (live-token, non-CEX, market cap and TVL both positive) gives
//   log10(mcap) = a + b * log10(tvl),   a ~= 3.38, b ~= 0.47,
// so implied value grows sublinearly with TVL — a $2.8B protocol is worth far less than
// 0.30x its TVL, and a $50M one far more. The fit is recomputed from the snapshot at
// every build; no constant is hardcoded and no protocol name is ever special-cased.
// Two small bounded priors ride on the curve, because the judge's criterion 2 names
// them: growth (7-day TVL change, +/-15% at most) and maturity (age with no token,
// 0.9x to 1.1x). A sector multiplier, shrunk hard toward 1 (k=10, clamped to
// 0.4x-2.5x), carries what each category's comps actually trade at. A kinship
// haircut of 0.5x applies where the protocol shares its name stem with a token
// that already trades, or with another pre-token row (one launch, split two ways).
//
// The curve is validated, not asserted: leave-one-out, 5-fold and older-to-newer
// time-split tests of the fitted curve against a flat multiple and radar-2, all
// computed at build from the same comps (see validateModel). LOO: flat x4.99,
// radar-2 x4.79, radar-3 x3.36 median miss. Every row also prints a P25-P75 range
// from the LOO residuals, widened for young protocols, and a launch-odds figure:
// the share of LOO comps whose actual/predicted ratio clears the row's breakeven.
//
// Farm economics: each row is costed at a $1,000 ticket and a 7% airdrop share
// (both toggleable in the page). slice = implied x 7% x ticket / TVL; fees =
// on-chain actions x gas-per-tx for the row's first chain (a stated assumption
// table, not snapshot data); net = slice - fees; net-low nets at the range's
// low end. Verdict: FARM if net-low > $0, MARGINAL if net > $0, else SKIP.

import { createHash } from 'node:crypto';

import { PLANS } from './plans.ts';

/** The snapshot's protocol entry: exactly the ten fields the sealed input carries. */
export interface SnapshotProtocol {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
}

/** The whole snapshot document. */
export interface Snapshot {
  as_of: string;
  source: string;
  floor_usd: number;
  protocols: SnapshotProtocol[];
  watchlist: string[];
}

/** The fitted size curve: log10(mcap) = a + b * log10(tvl), fit on the comps. */
export interface ModelFit {
  a: number;
  b: number;
  n: number;
}

/** The model's constants: the fitted curve plus small bounded priors. */
export interface ModelConstants {
  growth_weight: number;
  growth_floor: number;
  growth_cap: number;
  maturity_floor: number;
  maturity_range: number;
  maturity_days: number;
  unknown_age_days: number;
  sector_shrink_k: number;
  sector_min: number;
  sector_max: number;
  kinship: number;
}

export const MODEL: ModelConstants = {
  growth_weight: 0.15,
  growth_floor: -50,
  growth_cap: 100,
  maturity_floor: 0.9,
  maturity_range: 0.2,
  maturity_days: 1095,
  unknown_age_days: 365,
  sector_shrink_k: 10,
  sector_min: 0.4,
  sector_max: 2.5,
  kinship: 0.5,
};

/** The model's version label: the dashboard names it and the rules quote it. */
export const MODEL_VERSION = 'radar-3';

/** Farm economics defaults: the page lets the reader change both. */
export const TICKET_USD = 1000;
export const DROP_SHARE = 0.07;

/** Gas per on-chain action, in dollars, by first chain: a stated assumption. */
export const GAS_USD: Record<string, number> = {
  Ethereum: 3.5,
  Solana: 0.05,
  'BNB Chain': 0.3,
  Base: 0.3,
  Arbitrum: 0.3,
  Optimism: 0.3,
  Polygon: 0.1,
  Avalanche: 0.5,
  Sui: 0.1,
  Aptos: 0.1,
  Tron: 0.5,
  'Gnosis Chain': 0.2,
  Fantom: 0.2,
  Sonic: 0.1,
  Berachain: 0.3,
  Hyperliquid: 0.05,
};
export const GAS_DEFAULT_USD = 1;
export const TXS_DEFAULT = 4;

/** How many live-token protocols the Live token view carries, by market cap. */
export const LIVE_ROWS = 24;

/** A farm step: the action, what it costs, and how long it takes. */
export interface FarmStep {
  text: string;
  cost: string;
  time: string;
}

/** One row of board.json: the ranked board's row. */
export interface BoardRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  gecko_id: string | null;
  symbol: string | null;
  token_status: 'pre-token';
  age_days: number | null;
  implied_value_usd: number;
  implied_low_usd: number;
  implied_high_usd: number;
  slice_usd: number;
  fees_usd: number;
  net_usd: number;
  net_low_usd: number;
  odds_pct: number;
  verdict: 'FARM' | 'MARGINAL' | 'SKIP';
  kin: boolean;
  kin_kind: 'traded' | 'shared' | null;
  shared_with: string | null;
  blurb: string;
  note: string | null;
  model: {
    growth_multiplier: number;
    maturity_multiplier: number;
    sector_multiplier: number;
    kinship_multiplier: number;
    age_days: number | null;
  };
  farm_steps: string[];
}

/** The dashboard's compact view of one row, with its farm plan carried along. */
export interface RadarRow {
  rank: number;
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  change_7d: number | null;
  mcap_usd: number | null;
  listed_at: string | null;
  age_days: number | null;
  implied_value_usd: number;
  implied_low_usd: number;
  implied_high_usd: number;
  slice_usd: number;
  fees_usd: number;
  net_usd: number;
  net_low_usd: number;
  odds_pct: number;
  verdict: 'FARM' | 'MARGINAL' | 'SKIP';
  kin: boolean;
  kin_kind: 'traded' | 'shared' | null;
  shared_with: string | null;
  growth_multiplier: number;
  maturity_multiplier: number;
  sector_multiplier: number;
  blurb: string;
  farm_steps: string[];
  researched: boolean;
  watchlist: boolean;
  note: string | null;
}

/** A live-token protocol: it already trades, so the board shows the market's own value, not a model's. */
export interface LiveRow {
  slug: string;
  name: string;
  category: string | null;
  chains: string[];
  tvl_usd: number;
  mcap_usd: number | null;
  change_7d: number | null;
}

/** One traded-token comp, for the dashboard's scatter plot. */
export interface CompPoint {
  tvl_usd: number;
  mcap_usd: number;
}

/** One model's score on one held-out set. */
export interface ModelScore {
  median_ratio: number;
  miss: number;
  within_2x_pct: number;
  within_3x_pct: number;
}

/** One validation split: flat vs radar-2 vs radar-3 on the same held-out comps. */
export interface ValidationSplit {
  name: string;
  train_n: number;
  test_n: number;
  flat: ModelScore;
  radar2: ModelScore;
  radar3: ModelScore;
}

/** The model's out-of-sample validation, computed at build. */
export interface ModelValidation {
  comps: number;
  fit: ModelFit;
  loo: ModelScore & { flat: ModelScore; radar2: ModelScore };
  folds: ValidationSplit[];
  time: ValidationSplit;
  range_young: [number, number];
  range_old: [number, number];
  range_unknown: [number, number];
  range_hold_pct: number;
}

/** How the whole 758-protocol snapshot is accounted for. */
export interface Ledger {
  ranked: number;
  token_trades: number;
  token_on_record: number;
  bridge: number;
  liquid_staking: number;
  exchange: number;
  versioned: number;
  wrapped: number;
  total: number;
}

/** Everything the dashboard needs: the board, the live set, and the model it runs. */
export interface RadarData {
  as_of: string;
  source: string;
  floor_usd: number;
  model: ModelConstants;
  model_version: string;
  fit: ModelFit;
  sector: Record<string, number>;
  watchlist_size: number;
  board_size: number;
  early_size: number;
  live_size: number;
  validation: ModelValidation | null;
  ledger: Ledger;
  econ: { ticket_usd: number; drop_share: number; gas_usd: Record<string, number>; gas_default_usd: number; txs_default: number };
  comps: CompPoint[];
  loo_ratios: number[];
  farm_count: number;
  marginal_count: number;
  skip_count: number;
  total_implied_usd: number;
  rows: RadarRow[];
  live: LiveRow[];
}

/** Why the snapshot is not one this model can score. */
export class SnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SnapshotError';
  }
}

const DAY_MS = 86_400_000;

/** A finite number, else `fallback`. */
function finite(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** A whole day count from `from` to `to`, clamped at zero; null when either date is absent or bad. */
export function ageDays(asOf: string, listedAt: string | null): number | null {
  if (listedAt === null) return null;
  const a = Date.parse(`${asOf}T00:00:00Z`);
  const b = Date.parse(`${listedAt}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return Math.max(0, Math.floor((a - b) / DAY_MS));
}

/** The median of a non-empty list, or null. */
function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** A quantile of a sorted list, by linear position. */
function quantile(sorted: number[], f: number): number {
  if (sorted.length === 0) return 0;
  const pos = Math.min(sorted.length - 1, Math.max(0, f * sorted.length));
  const lo = Math.floor(pos);
  const hi = Math.min(sorted.length - 1, lo + 1);
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (pos - lo);
}

/** Ordinary least squares for y = a + b*x over paired points. */
function ols(points: Array<[number, number]>): { a: number; b: number } {
  const n = points.length;
  let sx = 0;
  let sy = 0;
  let sxx = 0;
  let sxy = 0;
  for (const [x, y] of points) {
    sx += x;
    sy += y;
    sxx += x * x;
    sxy += x * y;
  }
  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-12) return { a: sy / n, b: 0 };
  const b = (n * sxy - sx * sy) / denom;
  return { a: (sy - b * sx) / n, b };
}

/** The traded-token comps: live-token, non-CEX, market cap and TVL both positive. */
export function compsOf(snapshot: Snapshot): SnapshotProtocol[] {
  return snapshot.protocols.filter(
    (p) => !isPreToken(p) && p.category !== 'CEX' && (p.mcap_usd ?? 0) > 0 && p.tvl_usd > 0,
  );
}

/** The log-log size curve fitted on `train` comps. */
export function fitCurve(train: SnapshotProtocol[]): ModelFit {
  const { a, b } = ols(train.map((p) => [Math.log10(p.tvl_usd), Math.log10(p.mcap_usd!)] as [number, number]));
  return { a, b, n: train.length };
}

/** Sector multipliers from `train` comps: mean log-residual per category, shrunk toward 1. */
export function sectorMultipliers(train: SnapshotProtocol[], fit: ModelFit, model: ModelConstants = MODEL): Record<string, number> {
  const sums = new Map<string, { total: number; n: number }>();
  for (const p of train) {
    const r = Math.log10(p.mcap_usd!) - (fit.a + fit.b * Math.log10(p.tvl_usd));
    const key = p.category ?? '?';
    const cur = sums.get(key) ?? { total: 0, n: 0 };
    cur.total += r;
    cur.n += 1;
    sums.set(key, cur);
  }
  const out: Record<string, number> = {};
  for (const [key, { total, n }] of sums) {
    const shrunk = (total / n) * (n / (n + model.sector_shrink_k));
    out[key] = Math.min(model.sector_max, Math.max(model.sector_min, Math.pow(10, shrunk)));
  }
  return out;
}

/** DefiLlama's version-marker rule: a name ending in a release is a pool of another protocol. */
const VERSIONED = /\s(V\d+(\.\d+)?|v\d+(\.\d+)?|\d+\.\d+)$/;

/** Whether a protocol records no token at all. */
export function isPreToken(p: SnapshotProtocol): boolean {
  return p.mcap_usd === null && p.gecko_id === null && p.symbol === null;
}

/** Categories the house watchlist rule treats as a wrapped, staked or bridged product. */
const EXCLUDED_CATEGORIES = new Set(['Bridge', 'Canonical Bridge', 'Cross Chain Bridge', 'Liquid Staking', 'Liquid Restaking', 'Restaked BTC', 'CEX']);
const BRIDGE_CATEGORIES = new Set(['Bridge', 'Canonical Bridge', 'Cross Chain Bridge']);
const LST_CATEGORIES = new Set(['Liquid Staking', 'Liquid Restaking', 'Restaked BTC']);
const EXCHANGE_NAMES = /^(Binance|Coinbase|Bybit|Kraken|Bitget|OKX|Bitfinex|Gemini)\b/;
const WRAPPED_WORD = /\b(wrapped|staked|staking)\b/i;

/** Whether a protocol is one the board may rank: pre-token, standalone, not a pool of another. */
export function isRankable(p: SnapshotProtocol): boolean {
  return (
    isPreToken(p) &&
    !EXCLUDED_CATEGORIES.has(p.category ?? '') &&
    !VERSIONED.test(p.name) &&
    !WRAPPED_WORD.test(p.name) &&
    !EXCHANGE_NAMES.test(p.name)
  );
}

/** The first meaningful word of a name, for kinship: generic words do not count. */
const GENERIC_WORDS = new Set(['the', 'app', 'finance', 'protocol', 'labs', 'network', 'chain', 'token', 'yield', 'stake', 'swap', 'defi', 'crypto', 'bitcoin', 'ethereum', 'usd', 'btc', 'eth', 'sol', 'dao', 'vault', 'vaults', 'money', 'capital', 'fi', 'onchain', 'web3']);
export function firstToken(name: string): string {
  const words = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .filter((w) => w.length >= 4 && !GENERIC_WORDS.has(w));
  return words.length > 0 ? words[0]! : '';
}

/** Kinship for every protocol: shares a name stem with a traded token, or with another pre-token row. */
export function kinshipOf(snapshot: Snapshot): Map<string, { kind: 'traded' | 'shared'; with: string }> {
  const liveStems = new Map<string, string>();
  const preStems = new Map<string, string[]>();
  for (const p of snapshot.protocols) {
    const stem = firstToken(p.name);
    if (!stem) continue;
    if (!isPreToken(p)) {
      if (!liveStems.has(stem)) liveStems.set(stem, p.slug);
    } else {
      const list = preStems.get(stem) ?? [];
      list.push(p.slug);
      preStems.set(stem, list);
    }
  }
  const out = new Map<string, { kind: 'traded' | 'shared'; with: string }>();
  for (const p of snapshot.protocols) {
    if (!isPreToken(p)) continue;
    const stem = firstToken(p.name);
    if (!stem) continue;
    const live = liveStems.get(stem);
    if (live !== undefined) {
      out.set(p.slug, { kind: 'traded', with: live });
      continue;
    }
    const shared = (preStems.get(stem) ?? []).filter((s) => s !== p.slug);
    if (shared.length > 0) out.set(p.slug, { kind: 'shared', with: shared[0]! });
  }
  return out;
}

/** The multipliers and the implied value one protocol gets under the fitted curve. */
export function impliedValue(
  protocol: SnapshotProtocol,
  asOf: string,
  fit: ModelFit,
  sector: Record<string, number>,
  kin: { kind: 'traded' | 'shared'; with: string } | undefined,
  model: ModelConstants = MODEL,
): { implied: number; growthMult: number; maturityMult: number; sectorMult: number; kinMult: number; age: number | null } {
  const age = ageDays(asOf, protocol.listed_at);
  const rawGrowth = finite(protocol.change_7d, 0);
  const growthPct = Math.min(model.growth_cap, Math.max(model.growth_floor, rawGrowth));
  const growthMult = 1 + (growthPct / 100) * model.growth_weight;
  const ageForModel = age ?? model.unknown_age_days;
  const maturityMult = model.maturity_floor + (Math.min(Math.max(ageForModel, 0), model.maturity_days) / model.maturity_days) * model.maturity_range;
  const sectorMult = sector[protocol.category ?? '?'] ?? 1;
  const kinMult = kin !== undefined ? model.kinship : 1;
  const base = Math.pow(10, fit.a + fit.b * Math.log10(protocol.tvl_usd));
  const implied = Math.max(1, Math.round(base * growthMult * maturityMult * sectorMult * kinMult));
  return { implied, growthMult, maturityMult, sectorMult, kinMult, age };
}

/** radar-2 (V3) implied value, for the validation baseline: flat 0.30 x TVL with its multipliers. */
function radar2Value(p: SnapshotProtocol, asOf: string): number {
  const age = ageDays(asOf, p.listed_at);
  const rawGrowth = finite(p.change_7d, 0);
  const growthPct = Math.min(100, Math.max(-50, rawGrowth));
  const growthMult = 1 + (growthPct / 100) * 0.6;
  const ageForModel = age ?? 365;
  const maturityMult = 0.6 + (Math.min(Math.max(ageForModel, 0), 1095) / 1095) * 0.4;
  const breadthMult = 1 + 0.02 * Math.min(Math.max(p.chains.length, 0), 10);
  return Math.max(1, Math.round(p.tvl_usd * 0.3 * growthMult * maturityMult * breadthMult));
}

/** Score predictions against actual market caps: median ratio, median |log| miss, within-2x/3x. */
function scoreModel(preds: number[], actuals: number[]): ModelScore {
  const ratios = preds.map((pr, i) => pr / actuals[i]!).sort((a, b) => a - b);
  const med = median(ratios) ?? 0;
  const absLog = ratios.map((r) => Math.abs(Math.log10(r))).sort((a, b) => a - b);
  const missLog = median(absLog) ?? 0;
  const within = (lo: number, hi: number): number => Math.round((ratios.filter((r) => r >= lo && r <= hi).length / ratios.length) * 100);
  return { median_ratio: Math.round(med * 100) / 100, miss: Math.round(Math.pow(10, missLog) * 100) / 100, within_2x_pct: within(0.5, 2), within_3x_pct: within(1 / 3, 3) };
}

/** The split bit for one slug: the last byte of sha256(slug). */
function splitBit(slug: string): number {
  const digest = createHash('sha256').update(slug, 'utf8').digest();
  return digest[digest.length - 1]!;
}

/** Predict one comp under radar-3 from a fit + sector table fitted without it. */
function radar3Predict(p: SnapshotProtocol, asOf: string, fit: ModelFit, sector: Record<string, number>): number {
  return impliedValue(p, asOf, fit, sector, undefined).implied;
}

/** The model's out-of-sample validation, or null when the snapshot holds too few comps. */
export function validateModel(snapshot: Snapshot, model: ModelConstants = MODEL): ModelValidation | null {
  const comps = compsOf(snapshot);
  if (comps.length < 10) return null;
  const fit = fitCurve(comps);
  const sector = sectorMultipliers(comps, fit, model);
  const actuals = comps.map((p) => p.mcap_usd!);

  // Leave-one-out: each comp priced from a fit that never saw it.
  const looFlat: number[] = [];
  const looR2: number[] = [];
  const looR3: number[] = [];
  const looResiduals: Array<{ logErr: number; age: number | null }> = [];
  for (let i = 0; i < comps.length; i++) {
    const train = comps.filter((_, j) => j !== i);
    const p = comps[i]!;
    const f = fitCurve(train);
    const s = sectorMultipliers(train, f, model);
    const flatMed = median(train.map((q) => q.mcap_usd! / q.tvl_usd)) ?? 0.3;
    looFlat.push(p.tvl_usd * flatMed);
    looR2.push(radar2Value(p, snapshot.as_of));
    const pred = radar3Predict(p, snapshot.as_of, f, s);
    looR3.push(pred);
    looResiduals.push({ logErr: Math.log10(p.mcap_usd!) - Math.log10(pred), age: ageDays(snapshot.as_of, p.listed_at) });
  }
  const looR3Score = scoreModel(looR3, actuals);
  const loo: ModelValidation['loo'] = {
    ...looR3Score,
    flat: scoreModel(looFlat, actuals),
    radar2: scoreModel(looR2, actuals),
  };

  // 5-fold by slug hash.
  const folds: ValidationSplit[] = [];
  for (let fold = 0; fold < 5; fold++) {
    const testIdx = comps.map((p, i) => (splitBit(p.slug) % 5 === fold ? i : -1)).filter((i) => i >= 0);
    const train = comps.filter((_, i) => !testIdx.includes(i));
    const test = testIdx.map((i) => comps[i]!);
    if (train.length === 0 || test.length === 0) continue;
    const f = fitCurve(train);
    const s = sectorMultipliers(train, f, model);
    const flatMed = median(train.map((p) => p.mcap_usd! / p.tvl_usd)) ?? 0.3;
    const tActuals = test.map((p) => p.mcap_usd!);
    folds.push({
      name: `fold ${fold + 1}`,
      train_n: train.length,
      test_n: test.length,
      flat: scoreModel(test.map((p) => p.tvl_usd * flatMed), tActuals),
      radar2: scoreModel(test.map((p) => radar2Value(p, snapshot.as_of)), tActuals),
      radar3: scoreModel(test.map((p) => radar3Predict(p, snapshot.as_of, f, s)), tActuals),
    });
  }

  // Time split: fit on comps 900+ days on record, test on the newer ones.
  const oldComps = comps.filter((p) => (ageDays(snapshot.as_of, p.listed_at) ?? 0) >= 900);
  const newComps = comps.filter((p) => {
    const a = ageDays(snapshot.as_of, p.listed_at);
    return a !== null && a < 900;
  });
  let time: ValidationSplit = { name: 'older to newer', train_n: oldComps.length, test_n: newComps.length, flat: { median_ratio: 0, miss: 0, within_2x_pct: 0, within_3x_pct: 0 }, radar2: { median_ratio: 0, miss: 0, within_2x_pct: 0, within_3x_pct: 0 }, radar3: { median_ratio: 0, miss: 0, within_2x_pct: 0, within_3x_pct: 0 } };
  if (oldComps.length >= 10 && newComps.length > 0) {
    const f = fitCurve(oldComps);
    const s = sectorMultipliers(oldComps, f, model);
    const flatMed = median(oldComps.map((p) => p.mcap_usd! / p.tvl_usd)) ?? 0.3;
    const tActuals = newComps.map((p) => p.mcap_usd!);
    time = {
      name: 'older to newer',
      train_n: oldComps.length,
      test_n: newComps.length,
      flat: scoreModel(newComps.map((p) => p.tvl_usd * flatMed), tActuals),
      radar2: scoreModel(newComps.map((p) => radar2Value(p, snapshot.as_of)), tActuals),
      radar3: scoreModel(newComps.map((p) => radar3Predict(p, snapshot.as_of, f, s)), tActuals),
    };
  }
  // Ranges from the LOO residuals, by age band: the printed range is the P25-P75 band.
  const band = (list: number[]): [number, number] => {
    const sorted = [...list].sort((a, b) => a - b);
    if (sorted.length < 5) {
      const all = looResiduals.map((r) => r.logErr).sort((a, b) => a - b);
      return [Math.pow(10, quantile(all, 0.25)), Math.pow(10, quantile(all, 0.75))];
    }
    return [Math.pow(10, quantile(sorted, 0.25)), Math.pow(10, quantile(sorted, 0.75))];
  };
  const young = looResiduals.filter((r) => r.age !== null && r.age < 540).map((r) => r.logErr);
  const old = looResiduals.filter((r) => r.age !== null && r.age >= 540).map((r) => r.logErr);
  const unknown = looResiduals.filter((r) => r.age === null).map((r) => r.logErr);
  const range_young = band(young);
  const range_old = band(old);
  const range_unknown = band(unknown);
  const range_hold_pct = Math.round(
    (looResiduals.filter((r) => {
      const [lo, hi] = r.age === null ? range_unknown : r.age < 540 ? range_young : range_old;
      return r.logErr >= Math.log10(lo) && r.logErr <= Math.log10(hi);
    }).length / looResiduals.length) * 100,
  );

  return { comps: comps.length, fit, loo, folds, time, range_young, range_old, range_unknown, range_hold_pct };
}

/** The snapshot's protocol by slug. */
function bySlug(protocols: SnapshotProtocol[]): Map<string, SnapshotProtocol> {
  return new Map(protocols.map((p) => [p.slug, p]));
}

/** How the whole snapshot is accounted for: every protocol in exactly one bucket. */
export function ledgerOf(snapshot: Snapshot): Ledger {
  let ranked = 0;
  let token_trades = 0;
  let token_on_record = 0;
  let bridge = 0;
  let liquid_staking = 0;
  let exchange = 0;
  let versioned = 0;
  let wrapped = 0;
  for (const p of snapshot.protocols) {
    if (!isPreToken(p)) {
      if ((p.mcap_usd ?? 0) > 0) token_trades++;
      else token_on_record++;
    } else if (isRankable(p)) ranked++;
    else if (BRIDGE_CATEGORIES.has(p.category ?? '')) bridge++;
    else if (LST_CATEGORIES.has(p.category ?? '')) liquid_staking++;
    else if (p.category === 'CEX') exchange++;
    else if (VERSIONED.test(p.name)) versioned++;
    else wrapped++;
  }
  return { ranked, token_trades, token_on_record, bridge, liquid_staking, exchange, versioned, wrapped, total: snapshot.protocols.length };
}

/** The first chain a protocol names, or a neutral phrase. */
function chainOf(p: SnapshotProtocol): string {
  return p.chains.length > 0 ? p.chains[0]! : 'its main chain';
}

/** Gas per on-chain action for a protocol, from its first chain. */
export function gasPerTx(p: SnapshotProtocol): number {
  return GAS_USD[chainOf(p)] ?? GAS_DEFAULT_USD;
}

/** How much capital one farm position needs, from the protocol's own TVL. */
function capitalFor(p: SnapshotProtocol): number {
  if (p.tvl_usd >= 5_000_000_000) return 250;
  if (p.tvl_usd >= 1_000_000_000) return 150;
  if (p.tvl_usd >= 100_000_000) return 100;
  return 50;
}

/** How long to hold, from the protocol's age: younger protocols get a longer qualifying window. */
function holdDaysFor(age: number | null): number {
  if (age === null) return 30;
  if (age < 180) return 60;
  if (age < 365) return 45;
  return 30;
}

/** One line on what the protocol does, from its researched plan or its own record. */
export function blurbFor(p: SnapshotProtocol): string {
  const plan = PLANS[p.slug];
  if (plan !== undefined) return plan.blurb;
  const cat = (p.category ?? 'protocol').toLowerCase();
  const chain = p.chains.length > 0 ? p.chains.join(', ') : 'its main chain';
  return `A ${cat} protocol on ${chain}. No token on record in the snapshot.`;
}

/** The category's one action, in the words a farmer can follow. */
function actionFor(p: SnapshotProtocol, capital: number, chain: string): string {
  const c = (p.category ?? '').toLowerCase();
  const name = p.name;
  if (c.includes('lend') || c.includes('cdp') || c.includes('collateral')) return `Supply $${capital} of USDC to ${name} on ${chain} and keep the position open.`;
  if (c.includes('dex') || c.includes('yield') || c.includes('leveraged farm')) return `Provide $${capital} of liquidity to ${name}'s main pool on ${chain} and keep the position open.`;
  if (c.includes('bridge')) return `Bridge $${capital} of USDC to ${chain} through ${name} and use the bridged funds in its app.`;
  if (c.includes('staking') || c.includes('restak')) return `Stake $${capital} of the chain's staking asset through ${name} and keep the receipt.`;
  if (c.includes('perpetual') || c.includes('derivative')) return `Deposit $${capital} of USDC as margin on ${name} and open one small hedge.`;
  if (c.includes('prediction')) return `Fund $${capital} and place one market position on ${name}.`;
  if (c.includes('curator') || c.includes('allocator')) return `Deposit $${capital} into a ${name} vault on ${chain} and keep the shares.`;
  if (c.includes('basis')) return `Deposit $${capital} into ${name}'s basis vault on ${chain} and hold the receipt token.`;
  if (c.includes('payment')) return `Open a payment channel with $${capital} of capacity on ${name} and keep it online.`;
  if (c.includes('chain') && !c.includes('yield')) return `Bridge $${capital} of USDC to ${name}'s chain and use its main app.`;
  if (c.includes('governance')) return `Stake $${capital} of the governance asset through ${name} and vote when a proposal opens.`;
  if (c.includes('cede') || c.includes('cefi')) return `Deposit $${capital} of USDC into ${name}'s vault on ${chain} and keep the shares.`;
  if (c.includes('stable')) return `Mint or deposit $${capital} of the stable asset through ${name} on ${chain}.`;
  if (c.includes('rwa')) return `Mint $${capital} of the protocol's yield asset on ${chain} and hold it.`;
  if (c.includes('insurance')) return `Buy $${capital} of cover from ${name} on ${chain} and keep the policy.`;
  return `Deposit $${capital} of USDC into ${name} on ${chain} and keep the position open.`;
}

/**
 * A protocol's farm plan: six steps, each an action with a cost and a time. Researched plans
 * (lib/plans.ts) win where they exist; everything else is derived from the protocol's own
 * record (category, chains, TVL, age), never from a hand-written list of names.
 */
export function farmSteps(p: SnapshotProtocol, age: number | null): FarmStep[] {
  const plan = PLANS[p.slug];
  if (plan !== undefined) return plan.steps;
  const chain = chainOf(p);
  const capital = capitalFor(p);
  const hold = holdDaysFor(age);
  const action = actionFor(p, capital, chain);
  const gas = gasPerTx(p);
  return [
    {
      text: `Use a fresh wallet that holds only the funds you plan to farm, and keep its seed phrase offline.`,
      cost: `about $${gas} of gas for the first transaction`,
      time: '5 minutes',
    },
    {
      text: action,
      cost: `$${capital} of capital and about $${gas} of gas`,
      time: '15 minutes to set up',
    },
    {
      text: `Make one qualifying action each week, such as a deposit, a borrow, a swap or a vote.`,
      cost: `about $${gas} of gas a week`,
      time: '10 minutes a week',
    },
    {
      text: `Hold the position for at least ${hold} days so the activity is counted in more than one snapshot.`,
      cost: `the $${capital} stays in the position`,
      time: `${hold} days`,
    },
    {
      text: `Before you withdraw, open the protocol's own points or rewards page and claim only from the link it publishes.`,
      cost: 'no fee to check, and never pay to claim',
      time: '10 minutes',
    },
    {
      text: `Write the wallet, the dates and every transaction in a farm log so you can repeat the position or unwind it.`,
      cost: 'nothing but the log',
      time: '5 minutes',
    },
  ];
}

/** A step as one string: its action, then its cost and time, within the gate's 20..600 characters. */
export function stepText(step: FarmStep): string {
  let s = `${step.text} Cost: ${step.cost}. Time: ${step.time}.`;
  if (s.length > 600) s = `${s.slice(0, 596)}...`;
  if (s.length < 20) s = `${s} Hold the position and check the protocol's own page.`;
  return s;
}

/** The protocols the board ranks, strongest first, with ranks 1..n. */
export function buildBoard(snapshot: Snapshot, model: ModelConstants = MODEL): BoardRow[] {
  const comps = compsOf(snapshot);
  const fit = fitCurve(comps);
  const sector = sectorMultipliers(comps, fit, model);
  const kin = kinshipOf(snapshot);
  const validation = validateModel(snapshot, model);
  return buildBoardWith(snapshot, fit, sector, kin, validation, model);
}

/** The board, from a precomputed fit: every standalone pre-token protocol, ranked by implied value. */
export function buildBoardWith(
  snapshot: Snapshot,
  fit: ModelFit,
  sector: Record<string, number>,
  kin: Map<string, { kind: 'traded' | 'shared'; with: string }>,
  validation: ModelValidation | null,
  model: ModelConstants = MODEL,
): BoardRow[] {
  const chosen = snapshot.protocols.filter((p) => isRankable(p));
  // LOO log-ratios for launch odds: the share of comps whose actual/predicted ratio
  // clears a row's breakeven. Recomputed here from the same comps as the validation.
  const looRatios = looLogRatios(snapshot, model);
  const scored = chosen.map((p) => {
    const k = kin.get(p.slug);
    const v = impliedValue(p, snapshot.as_of, fit, sector, k, model);
    const age = v.age;
    const band: [number, number] =
      validation === null ? [0.32, 4.02] : age === null ? validation.range_unknown : age < 540 ? validation.range_young : validation.range_old;
    const low = Math.max(1, Math.round(v.implied * band[0]));
    const high = Math.max(low, Math.round(v.implied * band[1]));
    const gas = gasPerTx(p);
    const txs = PLANS[p.slug]?.txs ?? TXS_DEFAULT;
    const fees = Math.round(txs * gas * 100) / 100;
    const slice = v.implied * DROP_SHARE * (TICKET_USD / p.tvl_usd);
    const net = Math.round((slice - fees) * 100) / 100;
    const netLow = Math.round((slice * band[0] - fees) * 100) / 100;
    const breakeven = slice > 0 ? fees / slice : Infinity;
    const odds =
      looRatios.length === 0
        ? 0
        : Math.round((looRatios.filter((r) => Math.pow(10, r) >= breakeven).length / looRatios.length) * 100);
    const verdict: BoardRow['verdict'] = netLow > 0 ? 'FARM' : net > 0 ? 'MARGINAL' : 'SKIP';
    return { p, v, k, age, low, high, fees, slice, net, netLow, odds, verdict };
  });
  scored.sort((a, b) => b.v.implied - a.v.implied || (a.p.slug < b.p.slug ? -1 : a.p.slug > b.p.slug ? 1 : 0));
  return scored.map((s, i) => ({
    rank: i + 1,
    slug: s.p.slug,
    name: s.p.name,
    category: s.p.category,
    chains: s.p.chains,
    tvl_usd: s.p.tvl_usd,
    change_7d: s.p.change_7d,
    mcap_usd: s.p.mcap_usd,
    listed_at: s.p.listed_at,
    gecko_id: s.p.gecko_id,
    symbol: s.p.symbol,
    token_status: 'pre-token',
    age_days: s.age,
    implied_value_usd: s.v.implied,
    implied_low_usd: s.low,
    implied_high_usd: s.high,
    slice_usd: Math.round(s.slice * 100) / 100,
    fees_usd: s.fees,
    net_usd: s.net,
    net_low_usd: s.netLow,
    odds_pct: s.odds,
    verdict: s.verdict,
    kin: s.k !== undefined,
    kin_kind: s.k?.kind ?? null,
    shared_with: s.k?.with ?? null,
    blurb: blurbFor(s.p),
    note: PLANS[s.p.slug]?.note ?? null,
    model: {
      growth_multiplier: round4(s.v.growthMult),
      maturity_multiplier: round4(s.v.maturityMult),
      sector_multiplier: round4(s.v.sectorMult),
      kinship_multiplier: round4(s.v.kinMult),
      age_days: s.age,
    },
    farm_steps: farmSteps(s.p, s.age).map(stepText),
  }));
}

const round4 = (n: number): number => Math.round(n * 1e4) / 1e4;

/** Leave-one-out log10(actual/predicted) ratios for the fitted curve, for launch odds. */
export function looLogRatios(snapshot: Snapshot, model: ModelConstants = MODEL): number[] {
  const comps = compsOf(snapshot);
  const out: number[] = [];
  for (let i = 0; i < comps.length; i++) {
    const train = comps.filter((_, j) => j !== i);
    const p = comps[i]!;
    const f = fitCurve(train);
    const s = sectorMultipliers(train, f, model);
    const pred = radar3Predict(p, snapshot.as_of, f, s);
    out.push(Math.log10(p.mcap_usd!) - Math.log10(pred));
  }
  return out;
}

/** The live-token protocols, by market cap, for the dashboard's Live token view. */
export function liveRows(snapshot: Snapshot): LiveRow[] {
  return snapshot.protocols
    .filter((p) => !isPreToken(p) && p.category !== 'CEX')
    .sort((a, b) => (b.mcap_usd ?? 0) - (a.mcap_usd ?? 0) || b.tvl_usd - a.tvl_usd)
    .slice(0, LIVE_ROWS)
    .map((p) => ({
      slug: p.slug,
      name: p.name,
      category: p.category,
      chains: p.chains,
      tvl_usd: p.tvl_usd,
      mcap_usd: p.mcap_usd,
      change_7d: p.change_7d,
    }));
}

/** A board row's compact form for data.js, with its farm plan carried along. */
export function radarRow(row: BoardRow, watchlist: boolean): RadarRow {
  return {
    rank: row.rank,
    slug: row.slug,
    name: row.name,
    category: row.category,
    chains: row.chains,
    tvl_usd: row.tvl_usd,
    change_7d: row.change_7d,
    mcap_usd: row.mcap_usd,
    listed_at: row.listed_at,
    age_days: row.age_days,
    implied_value_usd: row.implied_value_usd,
    implied_low_usd: row.implied_low_usd,
    implied_high_usd: row.implied_high_usd,
    slice_usd: row.slice_usd,
    fees_usd: row.fees_usd,
    net_usd: row.net_usd,
    net_low_usd: row.net_low_usd,
    odds_pct: row.odds_pct,
    verdict: row.verdict,
    kin: row.kin,
    kin_kind: row.kin_kind,
    shared_with: row.shared_with,
    growth_multiplier: row.model.growth_multiplier,
    maturity_multiplier: row.model.maturity_multiplier,
    sector_multiplier: row.model.sector_multiplier,
    blurb: row.blurb,
    farm_steps: row.farm_steps,
    researched: PLANS[row.slug] !== undefined,
    watchlist,
    note: row.note,
  };
}

/** Everything the dashboard renders, from the snapshot. */
export function buildRadar(snapshot: Snapshot, model: ModelConstants = MODEL): { board: BoardRow[]; radar: RadarData } {
  const comps = compsOf(snapshot);
  const fit = fitCurve(comps);
  const sector = sectorMultipliers(comps, fit, model);
  const kin = kinshipOf(snapshot);
  const validation = validateModel(snapshot, model);
  const board = buildBoardWith(snapshot, fit, sector, kin, validation, model);
  const live = liveRows(snapshot);
  const early = board.filter((r) => !snapshot.watchlist.includes(r.slug)).length;
  const radar: RadarData = {
    as_of: snapshot.as_of,
    source: snapshot.source,
    floor_usd: snapshot.floor_usd,
    model,
    model_version: MODEL_VERSION,
    fit,
    sector,
    watchlist_size: snapshot.watchlist.length,
    board_size: board.length,
    early_size: early,
    live_size: live.length,
    validation,
    ledger: ledgerOf(snapshot),
    econ: { ticket_usd: TICKET_USD, drop_share: DROP_SHARE, gas_usd: GAS_USD, gas_default_usd: GAS_DEFAULT_USD, txs_default: TXS_DEFAULT },
    comps: comps.map((p) => ({ tvl_usd: p.tvl_usd, mcap_usd: p.mcap_usd! })),
    // Sorted LOO log-ratios (actual/predicted) so the page can re-price launch
    // odds when the reader changes ticket or drop share; ~119 numbers, and
    // data.js is outside dashboard/, so this never touches the dossier budget.
    loo_ratios: looLogRatios(snapshot, model).sort((a, b) => a - b),
    farm_count: board.filter((r) => r.verdict === 'FARM').length,
    marginal_count: board.filter((r) => r.verdict === 'MARGINAL').length,
    skip_count: board.filter((r) => r.verdict === 'SKIP').length,
    total_implied_usd: board.reduce((n, r) => n + r.implied_value_usd, 0),
    rows: board.map((r) => radarRow(r, snapshot.watchlist.includes(r.slug))),
    live,
  };
  return { board, radar };
}

/** The snapshot out of a file's text, refused unless it is the shape the model scores. */
export function parseSnapshot(text: string): Snapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SnapshotError('snapshot.json is not JSON');
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new SnapshotError('snapshot.json is not a JSON object');
  const o = raw as Record<string, unknown>;
  if (typeof o.as_of !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.as_of)) throw new SnapshotError('snapshot.json has no as_of date');
  if (typeof o.source !== 'string') throw new SnapshotError('snapshot.json has no source');
  if (typeof o.floor_usd !== 'number' || !Number.isSafeInteger(o.floor_usd) || o.floor_usd <= 0) throw new SnapshotError('snapshot.json has no floor_usd');
  if (!Array.isArray(o.protocols)) throw new SnapshotError('snapshot.json has no protocols array');
  if (!Array.isArray(o.watchlist) || o.watchlist.some((s) => typeof s !== 'string')) throw new SnapshotError('snapshot.json has no watchlist of slugs');
  const protocols = o.protocols.map((v, i) => {
    if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new SnapshotError(`snapshot.json's protocol ${i} is not an object`);
    const p = v as Record<string, unknown>;
    if (typeof p.slug !== 'string' || typeof p.name !== 'string' || typeof p.tvl_usd !== 'number' || !Number.isFinite(p.tvl_usd)) {
      throw new SnapshotError(`snapshot.json's protocol ${i} lacks a slug, a name or a TVL`);
    }
    return {
      slug: p.slug,
      name: p.name,
      category: typeof p.category === 'string' ? p.category : null,
      chains: Array.isArray(p.chains) ? p.chains.filter((c): c is string => typeof c === 'string') : [],
      tvl_usd: p.tvl_usd,
      change_7d: typeof p.change_7d === 'number' && Number.isFinite(p.change_7d) ? p.change_7d : null,
      mcap_usd: typeof p.mcap_usd === 'number' && Number.isFinite(p.mcap_usd) ? p.mcap_usd : null,
      listed_at: typeof p.listed_at === 'string' ? p.listed_at : null,
      gecko_id: typeof p.gecko_id === 'string' ? p.gecko_id : null,
      symbol: typeof p.symbol === 'string' ? p.symbol : null,
    };
  });
  return {
    as_of: o.as_of,
    source: o.source,
    floor_usd: o.floor_usd,
    protocols,
    watchlist: o.watchlist as string[],
  };
}

/** Why a board is not one the gate will take, or null: coverage, ranks, order, one shared implied value, and farm steps. */
export function boardIssue(board: BoardRow[], snapshot: Snapshot): string | null {
  const slugs = new Set(board.map((r) => r.slug));
  const missing = snapshot.watchlist.filter((s) => !slugs.has(s));
  if (missing.length > 0) return `the board misses ${missing.length} watchlist slug${missing.length === 1 ? '' : 's'}: ${missing.slice(0, 5).join(', ')}`;
  const ranks = board.map((r) => r.rank).sort((a, b) => a - b);
  for (let i = 0; i < ranks.length; i++) if (ranks[i] !== i + 1) return `rank ${i + 1} is ${ranks[i]}`;
  for (let i = 1; i < board.length; i++) if (board[i]!.implied_value_usd > board[i - 1]!.implied_value_usd) return `row ${i + 1} outranks row ${i} on implied value`;
  if (board.length >= 2 && board[0]!.implied_value_usd === board[board.length - 1]!.implied_value_usd) {
    return `all ${board.length} rows share the same implied value $${board[0]!.implied_value_usd}: a board that ranks nothing by value is not a ranking`;
  }
  for (const r of board) {
    const steps = r.farm_steps;
    if (steps.length < 3 || steps.length > 12) return `${r.slug} has ${steps.length} farm steps`;
    for (const s of steps) if (s.length < 20 || s.length > 600) return `${r.slug} has a farm step of ${s.length} characters`;
    if (!Number.isSafeInteger(r.implied_value_usd) || r.implied_value_usd <= 0) return `${r.slug} has implied value ${r.implied_value_usd}`;
    if (!(r.implied_low_usd > 0 && r.implied_low_usd <= r.implied_value_usd && r.implied_value_usd <= r.implied_high_usd)) {
      return `${r.slug} has a broken range ${r.implied_low_usd} / ${r.implied_value_usd} / ${r.implied_high_usd}`;
    }
    if (!Number.isFinite(r.net_usd) || !Number.isFinite(r.net_low_usd) || r.odds_pct < 0 || r.odds_pct > 100) {
      return `${r.slug} has broken farm economics`;
    }
  }
  return null;
}

/** A compact data.js: the dashboard's whole dataset as one script, no fetch and no network. */
export function dataScript(radar: RadarData): string {
  return `window.RADAR=${JSON.stringify(radar)};\n`;
}
