/**
 * Elder overload chain, from the RuneScape Wiki (Oct 2026).
 * One elder (6) is one supreme (6), one primal extract, and one clean fellstalk.
 * A supreme takes 4 doses of overload and 4 doses of each super.
 * A (4) you already have is 4 doses and a (3) is 3. Doses still short are mixed
 * as 3-dose potions, so one missing dose is 1/3 of a mix. That mix is then
 * rounded up: 1 1/3 potions becomes 2. An overload (3) is
 * one of each extreme (3) plus a torstol, and each extreme is one super (3).
 * Unfinished potions are included in the super XP. No well, scroll, or master cape.
 */

export type Stock = Record<string, number>;

export type Line = { id: string; count: number; xp: number };

export type Plan = { xp: number; crafts: Line[]; missing: Line[] };

type Style = {
  id: string;
  superXp: number;
  extXp: number;
  herb: string;
  secondary: string;
  secondaryQty: number;
  extSecondary: string;
  extQty: number;
};

const styles: Style[] = [
  { id: "atk", superXp: 101, extXp: 220, herb: "irit", secondary: "newt", secondaryQty: 1, extSecondary: "avantoe", extQty: 1 },
  { id: "str", superXp: 126, extXp: 230, herb: "kwuarm", secondary: "limpwurt", secondaryQty: 1, extSecondary: "dwarf", extQty: 1 },
  { id: "def", superXp: 151, extXp: 240, herb: "cadantine", secondary: "berries", secondaryQty: 1, extSecondary: "lantadyme", extQty: 1 },
  { id: "rng", superXp: 163.5, extXp: 260, herb: "dwarf", secondary: "wine", secondaryQty: 1, extSecondary: "spikes", extQty: 5 },
  { id: "mag", superXp: 173.5, extXp: 250, herb: "lantadyme", secondary: "cactus", secondaryQty: 1, extSecondary: "mud", extQty: 1 },
  { id: "nec", superXp: 178.5, extXp: 265, herb: "spirit", secondary: "blood", secondaryQty: 5, extSecondary: "miasma", extQty: 1 },
];

export type FieldGroup = "made" | "herbs" | "secondaries" | "other";

export type Field = { id: string; label: string; group: FieldGroup };

export const fieldGroups: { id: FieldGroup; title: string; note?: string }[] = [
  { id: "made", title: "Already made" },
  { id: "herbs", title: "Clean herbs" },
  {
    id: "secondaries",
    title: "Secondaries",
    note: "Super necromancy uses 5 congealed blood. Extreme ranging uses 5 grenwall spikes.",
  },
  { id: "other", title: "Vials and flasks" },
];

export const fields: Field[] = [
  { id: "elder", label: "Elder overload (6)", group: "made" },
  { id: "supreme", label: "Supreme overload (6)", group: "made" },
  { id: "ovl4", label: "Overload (4)", group: "made" },
  { id: "overload", label: "Overload (3)", group: "made" },
  { id: "ext-atk", label: "Extreme attack (3)", group: "made" },
  { id: "ext-str", label: "Extreme strength (3)", group: "made" },
  { id: "ext-def", label: "Extreme defence (3)", group: "made" },
  { id: "ext-mag", label: "Extreme magic (3)", group: "made" },
  { id: "ext-rng", label: "Extreme ranging (3)", group: "made" },
  { id: "ext-nec", label: "Extreme necromancy (3)", group: "made" },
  { id: "sup4-atk", label: "Super attack (4)", group: "made" },
  { id: "sup-atk", label: "Super attack (3)", group: "made" },
  { id: "sup4-str", label: "Super strength (4)", group: "made" },
  { id: "sup-str", label: "Super strength (3)", group: "made" },
  { id: "sup4-def", label: "Super defence (4)", group: "made" },
  { id: "sup-def", label: "Super defence (3)", group: "made" },
  { id: "sup4-rng", label: "Super ranging (4)", group: "made" },
  { id: "sup-rng", label: "Super ranging (3)", group: "made" },
  { id: "sup4-mag", label: "Super magic (4)", group: "made" },
  { id: "sup-mag", label: "Super magic (3)", group: "made" },
  { id: "sup4-nec", label: "Super necromancy (4)", group: "made" },
  { id: "sup-nec", label: "Super necromancy (3)", group: "made" },
  { id: "extract", label: "Primal extract", group: "made" },
  { id: "irit", label: "Irit", group: "herbs" },
  { id: "kwuarm", label: "Kwuarm", group: "herbs" },
  { id: "cadantine", label: "Cadantine", group: "herbs" },
  { id: "dwarf", label: "Dwarf weed", group: "herbs" },
  { id: "lantadyme", label: "Lantadyme", group: "herbs" },
  { id: "spirit", label: "Spirit weed", group: "herbs" },
  { id: "avantoe", label: "Avantoe", group: "herbs" },
  { id: "torstol", label: "Torstol", group: "herbs" },
  { id: "fellstalk", label: "Fellstalk", group: "herbs" },
  { id: "newt", label: "Eye of newt", group: "secondaries" },
  { id: "limpwurt", label: "Limpwurt root", group: "secondaries" },
  { id: "berries", label: "White berries", group: "secondaries" },
  { id: "wine", label: "Wine of Zamorak", group: "secondaries" },
  { id: "cactus", label: "Potato cactus", group: "secondaries" },
  { id: "blood", label: "Congealed blood", group: "secondaries" },
  { id: "spikes", label: "Grenwall spikes", group: "secondaries" },
  { id: "mud", label: "Ground mud runes", group: "secondaries" },
  { id: "miasma", label: "Ground miasma rune", group: "secondaries" },
  { id: "pulp", label: "Primal fruit pulp", group: "secondaries" },
  { id: "water", label: "Vial of water", group: "other" },
  { id: "vial", label: "Empty vial", group: "other" },
  { id: "flask", label: "Crystal flask", group: "other" },
];

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    const next = x % y;
    x = y;
    y = next;
  }
  return x || 1;
}

/** Whole numbers stay whole. Thirds and halves stay as fractions, so 4/3 is 1 1/3. */
export function formatExact(n: number): string {
  if (!Number.isFinite(n)) return "0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  for (const den of [1, 2, 3, 6]) {
    const num = Math.round(abs * den);
    if (Math.abs(abs * den - num) > 1e-4) continue;
    const divisor = gcd(num, den);
    const numerator = num / divisor;
    const denominator = den / divisor;
    const whole = Math.floor(numerator / denominator);
    const rest = numerator % denominator;
    const wholeText = whole.toLocaleString("en-US");
    if (rest === 0) return sign + wholeText;
    if (whole === 0) return `${sign}${rest}/${denominator}`;
    return `${sign}${wholeText} ${rest}/${denominator}`;
  }
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function qty(stock: Stock, id: string): number {
  const n = stock[id] ?? 0;
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

function more(need: number, have: number): number {
  const left = need - have;
  return left > 1e-6 ? left : 0;
}

function snap(n: number): number {
  const whole = Math.round(n);
  return Math.abs(n - whole) < 1e-6 ? whole : n;
}

/** Doses still short, as a count of 3-dose mixes. A (4) is 4 doses and a (3) is 3. */
function mixesFromDoses(needDoses: number, ownedDoses: number): number {
  return more(needDoses, ownedDoses) / 3;
}

/** 1 1/3 potions is a mix you cannot stop partway through, so it becomes 2. */
function whole(n: number): number {
  return Math.ceil(snap(n));
}

export function plan(goal: number, stock: Stock): Plan {
  const elders = Math.max(0, Math.floor(goal));
  const eldersToCraft = more(elders, qty(stock, "elder"));
  const supremesToCraft = more(eldersToCraft, qty(stock, "supreme"));
  const overloadCrafts = mixesFromDoses(
    supremesToCraft * 4,
    qty(stock, "ovl4") * 4 + qty(stock, "overload") * 3,
  );

  const need = new Map<string, number>();
  const add = (id: string, count: number) => need.set(id, (need.get(id) ?? 0) + count);
  const pending: Line[] = [];
  let xp = 0;

  const craft = (id: string, count: number, each: number) => {
    const n = whole(count);
    if (n <= 0) return;
    const lineXp = each * n;
    pending.push({ id, count: n, xp: lineXp });
    xp += lineXp;
  };

  const superCrafts: Line[] = [];
  const extremeCraftsOut: Line[] = [];
  for (const style of styles) {
    const extremeCrafts = more(overloadCrafts, qty(stock, `ext-${style.id}`));
    const supers = mixesFromDoses(
      extremeCrafts * 3 + supremesToCraft * 4,
      qty(stock, `sup4-${style.id}`) * 4 + qty(stock, `sup-${style.id}`) * 3,
    );
    const superCount = whole(supers);
    const extremeCount = whole(extremeCrafts);
    if (superCount > 0) superCrafts.push({ id: `sup-${style.id}`, count: superCount, xp: style.superXp * superCount });
    if (extremeCount > 0) {
      extremeCraftsOut.push({ id: `ext-${style.id}`, count: extremeCount, xp: style.extXp * extremeCount });
    }
    add("water", superCount);
    add(style.herb, superCount);
    add(style.secondary, superCount * style.secondaryQty);
    add(style.extSecondary, extremeCount * style.extQty);
  }
  for (const line of [...superCrafts, ...extremeCraftsOut]) {
    pending.push(line);
    xp += line.xp;
  }

  craft("overload", overloadCrafts, 1000);
  craft("supreme", supremesToCraft, 600);

  const extractCrafts = Math.max(0, eldersToCraft - qty(stock, "extract"));
  craft("extract", extractCrafts, 145);
  craft("elder", eldersToCraft, 850);

  add("torstol", whole(overloadCrafts));
  add("flask", supremesToCraft);
  add("vial", extractCrafts);
  add("pulp", extractCrafts);
  add("fellstalk", eldersToCraft);

  const missing: Line[] = [];
  for (const field of fields) {
    const count = snap((need.get(field.id) ?? 0) - qty(stock, field.id));
    if (count > 1e-6) missing.push({ id: field.id, count, xp: 0 });
  }

  return { xp, crafts: pending, missing };
}

export function maxElders(stock: Stock): number {
  const afford = (n: number) => plan(n, stock).missing.length === 0;
  let lo = 0;
  let hi = 1;
  while (afford(hi)) {
    lo = hi;
    if (hi >= 1_000_000) return 1_000_000;
    hi = Math.min(hi * 2, 1_000_000);
  }
  while (lo + 1 < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (afford(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

function selfCheck() {
  const bill = (goal: number, stock: Stock) =>
    Object.fromEntries(plan(goal, stock).missing.map((line) => [line.id, line.count]));

  const three = bill(3, { extract: 3 });
  const expected: Record<string, number> = {
    water: 48,
    flask: 3,
    irit: 8,
    newt: 8,
    avantoe: 4,
    kwuarm: 8,
    limpwurt: 8,
    dwarf: 12,
    cadantine: 8,
    berries: 8,
    lantadyme: 12,
    wine: 8,
    spikes: 20,
    cactus: 8,
    mud: 4,
    spirit: 8,
    blood: 40,
    miasma: 4,
    torstol: 4,
    fellstalk: 3,
  };
  for (const [id, count] of Object.entries(expected)) {
    if (three[id] !== count) throw new Error(`3 elders ${id}: got ${three[id] ?? 0}, want ${count}`);
  }
  const extra = Object.keys(three).filter((id) => expected[id] === undefined);
  if (extra.length > 0) throw new Error(`unexpected missing: ${extra.join(", ")}`);
  if (plan(3, { extract: 3 }).xp !== 21358) throw new Error(`xp ${plan(3, { extract: 3 }).xp}`);
  if (plan(3, {}).xp !== 21793) throw new Error(`xp with extract ${plan(3, {}).xp}`);
  const one = plan(1, { extract: 1 });
  const craftCount = (id: string) => one.crafts.find((line) => line.id === id)?.count ?? 0;
  if (craftCount("overload") !== 2) throw new Error(`overload crafts ${craftCount("overload")}`);
  if (craftCount("ext-atk") !== 2) throw new Error(`extreme crafts ${craftCount("ext-atk")}`);
  if (craftCount("sup-atk") !== 3) throw new Error(`super crafts ${craftCount("sup-atk")}`);
  if (one.xp !== 9060.5) throw new Error(`one elder xp ${one.xp}`);
  const oneBill = bill(1, { extract: 1 });
  if (oneBill.irit !== 3) throw new Error(`irit ${oneBill.irit}`);
  if (oneBill.torstol !== 2) throw new Error(`torstol ${oneBill.torstol}`);
  if (oneBill.spikes !== 10) throw new Error(`spikes ${oneBill.spikes}`);
  if (oneBill.blood !== 15) throw new Error(`blood ${oneBill.blood}`);
  if (oneBill.water !== 18) throw new Error(`water ${oneBill.water}`);
  if (oneBill.dwarf !== 5) throw new Error(`dwarf ${oneBill.dwarf}`);
  if (formatExact(8 / 3) !== "2 2/3") throw new Error(formatExact(8 / 3));
  if (formatExact(4 / 3) !== "1 1/3") throw new Error(formatExact(4 / 3));
  if (formatExact(40 / 3) !== "13 1/3") throw new Error(formatExact(40 / 3));
  if (formatExact(20 / 3) !== "6 2/3") throw new Error(formatExact(20 / 3));
  if (formatExact(4000 / 3) !== "1,333 1/3") throw new Error(formatExact(4000 / 3));
  if (formatExact(21793 / 3) !== "7,264 1/3") throw new Error(formatExact(21793 / 3));
  if (formatExact(16) !== "16") throw new Error(formatExact(16));

  const ready: Stock = { overload: 2, flask: 1, fellstalk: 1, extract: 1 };
  for (const style of styles) ready[`sup-${style.id}`] = 2;
  if (maxElders(ready) !== 1) throw new Error(`two overloads make ${maxElders(ready)}`);
  if (maxElders({ ...ready, overload: 1 }) !== 0) throw new Error("one overload is only 3 doses");
  if (maxElders({ supreme: 1, extract: 1, fellstalk: 1 }) !== 1) throw new Error("owned supreme");
  if (plan(1, { supreme: 1, extract: 1, fellstalk: 1 }).xp !== 850) throw new Error("elder xp only");
  if (maxElders({ elder: 2 }) !== 2) throw new Error("owned elders");
  if (maxElders({}) !== 0) throw new Error("empty stock");

  const exact: Stock = { extract: 3, ...expected };
  if (maxElders(exact) !== 3) throw new Error(`exact stock makes ${maxElders(exact)}`);
  if (maxElders({ ...exact, irit: 7 }) !== 2) throw new Error(`short irit makes ${maxElders({ ...exact, irit: 7 })}`);

  const poured: Stock = { ovl4: 1, flask: 1, fellstalk: 1, extract: 1 };
  for (const style of styles) poured[`sup4-${style.id}`] = 1;
  const pouredPlan = plan(1, poured);
  if (maxElders(poured) !== 1) throw new Error(`4-dose set makes ${maxElders(poured)}`);
  if (pouredPlan.missing.length !== 0) throw new Error("4-dose set should be complete");
  if (pouredPlan.xp !== 1450) throw new Error(`4-dose xp ${pouredPlan.xp}`);
  const pouredIds = pouredPlan.crafts.map((line) => line.id).join(",");
  if (pouredIds !== "supreme,elder") throw new Error(`4-dose crafts ${pouredIds}`);

  const attackOnly = plan(1, { extract: 1, "sup4-atk": 1 });
  const count = (result: Plan, id: string) => result.crafts.find((line) => line.id === id)?.count ?? 0;
  if (count(attackOnly, "sup-atk") !== 2) throw new Error(`one super (4) ${count(attackOnly, "sup-atk")}`);
  if (count(attackOnly, "sup-str") !== 3) throw new Error(`other super ${count(attackOnly, "sup-str")}`);
  if (count(plan(1, { extract: 1, "sup4-atk": 2 }), "sup-atk") !== 0) throw new Error("two super (4) cover the doses");
  if (count(plan(1, { extract: 1, "sup4-atk": 1, "sup-atk": 1 }), "sup-atk") !== 1) throw new Error("mixed super doses");
  const ownedFour = plan(1, { extract: 1, ovl4: 1 });
  if (count(ownedFour, "overload") !== 0 || count(ownedFour, "ext-atk") !== 0) throw new Error("owned overload (4)");
  if (count(ownedFour, "sup-atk") !== 2) throw new Error(`supers after overload (4) ${count(ownedFour, "sup-atk")}`);
  if (count(plan(2, { extract: 2, ovl4: 1, overload: 1 }), "overload") !== 1) throw new Error("mixed overload doses");
}

selfCheck();
