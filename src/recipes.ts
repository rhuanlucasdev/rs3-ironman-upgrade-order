/**
 * Vulnerability bombs, powerburst of vitality, weapon poison +++, adrenaline, and divine charges, from the RuneScape Wiki (Oct 2026).
 * Improved recipes use the unboosted Herblore level. +1 is faster and uses the same
 * ingredients. +2 uses fewer of them. A partial Saradomin brew is rounded up.
 * Primal extract, when it still has to be mixed, is an empty vial and primal fruit pulp.
 */

import type { Line, Plan, Stock } from "./calc";

export type Recipe = {
  id: "base" | "plus1" | "plus2";
  name: string;
  level: number;
  detail: string;
};

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

function whole(n: number): number {
  return Math.ceil(snap(n));
}

function mixesFromDoses(needDoses: number, ownedDoses: number): number {
  return more(needDoses, ownedDoses) / 3;
}

const EXTRACT_XP = 145;

export function vulnRecipe(level: number): Recipe | null {
  const lv = Math.floor(level);
  if (lv >= 107) {
    return { id: "plus2", name: "Improved +2", level: 107, detail: "3 soul runes, 3 chaos runes, and 1 bottled dinosaur roar." };
  }
  if (lv >= 105) {
    return { id: "plus1", name: "Improved +1", level: 105, detail: "Same ingredients as the base recipe, made in two ticks." };
  }
  if (lv >= 103) {
    return { id: "base", name: "Base", level: 103, detail: "5 soul runes, 5 chaos runes, and 2 bottled dinosaur roars." };
  }
  return null;
}

export function vitalityRecipe(level: number): Recipe | null {
  const lv = Math.floor(level);
  if (lv >= 109) {
    return { id: "plus2", name: "Improved +2", level: 109, detail: "1 poison slime and a Saradomin brew (3)." };
  }
  if (lv >= 107) {
    return { id: "plus1", name: "Improved +1", level: 107, detail: "Same ingredients as the base recipe, made in two ticks." };
  }
  if (lv >= 105) {
    return { id: "base", name: "Base", level: 105, detail: "2 poison slime and a Saradomin brew (4)." };
  }
  return null;
}

function finish(xp: number, crafts: Line[], need: Map<string, number>, stock: Stock): Plan {
  const missing: Line[] = [];
  for (const [id, count] of need) {
    const left = snap(count - qty(stock, id));
    if (left > 1e-6) missing.push({ id, count: left, xp: 0 });
  }
  return { xp, crafts, missing };
}

export function planVuln(goal: number, stock: Stock, level: number): Plan {
  const recipe = vulnRecipe(level);
  const toMake = recipe ? more(Math.floor(goal), qty(stock, "vuln")) : 0;
  if (toMake === 0) return { xp: 0, crafts: [], missing: [] };
  const roar = recipe!.id === "plus2" ? 1 : 2;
  const runes = recipe!.id === "plus2" ? 3 : 5;
  const extractCrafts = more(toMake, qty(stock, "extract"));
  const need = new Map<string, number>();
  const add = (id: string, count: number) => need.set(id, (need.get(id) ?? 0) + count);
  add("bomb-vial", toMake);
  add("dwarf", toMake);
  add("soul", toMake * runes);
  add("chaos", toMake * runes);
  add("roar", toMake * roar);
  add("pulp", extractCrafts);
  add("vial", extractCrafts);
  const crafts: Line[] = [];
  if (extractCrafts > 0) crafts.push({ id: "extract", count: extractCrafts, xp: EXTRACT_XP * extractCrafts });
  crafts.push({ id: "vuln", count: toMake, xp: 1100 * toMake });
  return finish(1100 * toMake + EXTRACT_XP * extractCrafts, crafts, need, stock);
}

const BREW_XP = 180;
const UNF_XP = 1;

export function planVitality(goal: number, stock: Stock, level: number): Plan {
  const recipe = vitalityRecipe(level);
  const toMake = recipe ? more(Math.floor(goal), qty(stock, "vitality")) : 0;
  if (toMake === 0) return { xp: 0, crafts: [], missing: [] };
  const brewDoses = recipe!.id === "plus2" ? 3 : 4;
  const slime = recipe!.id === "plus2" ? 1 : 2;
  const ownedDoses = qty(stock, "brew4") * 4 + qty(stock, "brew") * 3;
  const brewCrafts = whole(mixesFromDoses(toMake * brewDoses, ownedDoses));
  const unfCrafts = more(brewCrafts, qty(stock, "toad-unf"));
  const extractCrafts = more(toMake, qty(stock, "extract"));
  const need = new Map<string, number>();
  const add = (id: string, count: number) => need.set(id, (need.get(id) ?? 0) + count);
  add("pb-vial", toMake);
  add("slime", toMake * slime);
  add("rocktail", toMake);
  add("nest", brewCrafts);
  add("toadflax", unfCrafts);
  add("water", unfCrafts);
  add("pulp", extractCrafts);
  add("vial", extractCrafts);
  const crafts: Line[] = [];
  if (extractCrafts > 0) crafts.push({ id: "extract", count: extractCrafts, xp: EXTRACT_XP * extractCrafts });
  if (unfCrafts > 0) crafts.push({ id: "toad-unf", count: unfCrafts, xp: UNF_XP * unfCrafts });
  if (brewCrafts > 0) crafts.push({ id: "brew", count: brewCrafts, xp: BREW_XP * brewCrafts });
  crafts.push({ id: "vitality", count: toMake, xp: 1150 * toMake });
  const xp = 1150 * toMake + BREW_XP * brewCrafts + UNF_XP * unfCrafts + EXTRACT_XP * extractCrafts;
  return finish(xp, crafts, need, stock);
}

export function maxMade(owned: number, open: boolean, plan: (goal: number) => Plan): number {
  if (!open) return owned;
  const afford = (n: number) => plan(n).missing.length === 0;
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

const EMPTY: Plan = { xp: 0, crafts: [], missing: [] };

export function planPoison(goal: number, stock: Stock, level: number): Plan {
  if (Math.floor(level) < 100) return EMPTY;
  const toMake = more(Math.floor(goal), qty(stock, "wpp3"));
  if (toMake === 0) return EMPTY;
  const plusCrafts = whole(mixesFromDoses(toMake * 3, qty(stock, "wpp2-4") * 4 + qty(stock, "wpp2") * 3));
  const unfCrafts = more(plusCrafts, qty(stock, "wpp-unf"));
  const extractCrafts = more(toMake, qty(stock, "extract"));
  const need = new Map<string, number>();
  const add = (id: string, count: number) => need.set(id, (need.get(id) ?? 0) + count);
  add("coconut", unfCrafts);
  add("nightshade", unfCrafts);
  add("ivy", plusCrafts);
  add("slime", toMake);
  add("pulp", extractCrafts);
  add("vial", extractCrafts);
  const crafts: Line[] = [];
  let xp = 0;
  const craft = (id: string, count: number, each: number) => {
    if (count <= 0) return;
    crafts.push({ id, count, xp: each * count });
    xp += each * count;
  };
  craft("extract", extractCrafts, EXTRACT_XP);
  craft("wpp-unf", unfCrafts, 1);
  craft("wpp2", plusCrafts, 190);
  craft("wpp3", toMake, 700);
  return finish(xp, crafts, need, stock);
}

const CHARM_EACH = 4;

export function charmingHeld(stock: Stock): number {
  return Math.floor((qty(stock, "charming4") * 4 + qty(stock, "charming") * 3) / 3);
}

export function planCharming(goal: number, stock: Stock, level: number): Plan {
  if (Math.floor(level) < 102) return EMPTY;
  const mixes = whole(mixesFromDoses(Math.floor(goal) * 3, qty(stock, "charming4") * 4 + qty(stock, "charming") * 3));
  if (mixes === 0) return EMPTY;
  const extractCrafts = more(mixes, qty(stock, "extract"));
  const need = new Map<string, number>();
  const add = (id: string, count: number) => need.set(id, (need.get(id) ?? 0) + count);
  for (const id of ["gold", "green", "crimson", "blue"]) add(id, mixes * CHARM_EACH);
  add("chitin", mixes);
  add("pulp", extractCrafts);
  add("vial", extractCrafts);
  const crafts: Line[] = [];
  let xp = 0;
  const craft = (id: string, count: number, each: number) => {
    if (count <= 0) return;
    crafts.push({ id, count, xp: each * count });
    xp += each * count;
  };
  craft("extract", extractCrafts, EXTRACT_XP);
  craft("charming", mixes, 1000);
  return finish(xp, crafts, need, stock);
}

export type AdrenPick = {
  kind: "adrenaline" | "super" | "enhanced" | "renewal";
  name: string;
  level: number;
  detail: string;
  output: string;
  unit: string;
  goal: string;
};

export function adrenPick(level: number): AdrenPick | null {
  const lv = Math.floor(level);
  if (lv >= 119) {
    return {
      kind: "renewal",
      name: "Adrenaline renewal",
      level: 119,
      detail: "Improved +2. 40% adrenaline. One super adrenaline (3), 1 roar, clean arbuck, and primal extract.",
      output: "renewal",
      unit: "Adrenaline renewal (4)",
      goal: "Adrenaline renewals you want",
    };
  }
  if (lv >= 117) {
    return {
      kind: "renewal",
      name: "Adrenaline renewal",
      level: 117,
      detail: "Improved +1, one tick faster. A super adrenaline (4), 2 roars, clean arbuck, and primal extract. 40% adrenaline.",
      output: "renewal",
      unit: "Adrenaline renewal (4)",
      goal: "Adrenaline renewals you want",
    };
  }
  if (lv >= 115) {
    return {
      kind: "renewal",
      name: "Adrenaline renewal",
      level: 115,
      detail: "40% adrenaline over 6 seconds. A super adrenaline (4), 2 roars, clean arbuck, and primal extract.",
      output: "renewal",
      unit: "Adrenaline renewal (4)",
      goal: "Adrenaline renewals you want",
    };
  }
  if (lv >= 90) {
    return {
      kind: "enhanced",
      name: "Enhanced replenishment",
      level: 90,
      detail: "30% adrenaline, plus a super restore. This needs the replenishment recipe from Lady Meilyr.",
      output: "enhanced",
      unit: "Enhanced replenishment (6)",
      goal: "Enhanced replenishment potions you want",
    };
  }
  if (lv >= 87) {
    return {
      kind: "super",
      name: "Super adrenaline",
      level: 87,
      detail: "30% adrenaline. An adrenaline potion (3) and an adrenaline crystal. Replenishment is the same level but only restores 25%.",
      output: "super-adren",
      unit: "Super adrenaline (3)",
      goal: "Super adrenaline potions you want",
    };
  }
  if (lv >= 84) {
    return {
      kind: "adrenaline",
      name: "Adrenaline potion",
      level: 84,
      detail: "25% adrenaline. A super energy (3) and a papaya fruit.",
      output: "adren",
      unit: "Adrenaline potion (3)",
      goal: "Adrenaline potions you want",
    };
  }
  return null;
}

function doses(stock: Stock, four: string, three: string): number {
  return qty(stock, four) * 4 + qty(stock, three) * 3;
}

export function planAdrenaline(goal: number, stock: Stock, level: number): Plan {
  const pick = adrenPick(level);
  if (!pick) return EMPTY;
  const lv = Math.floor(level);
  const toMake = more(Math.floor(goal), qty(stock, pick.output));
  if (toMake === 0) return EMPTY;
  const need = new Map<string, number>();
  const add = (id: string, count: number) => {
    if (count > 0) need.set(id, (need.get(id) ?? 0) + count);
  };
  const crafts: Line[] = [];
  let xp = 0;
  const craft = (id: string, count: number, each: number) => {
    const n = whole(count);
    if (n <= 0) return;
    crafts.push({ id, count: n, xp: each * n });
    xp += each * n;
  };

  let adrenCrafts = 0;
  let crystalNeed = 0;
  let extractNeed = 0;
  let restoreCrafts = 0;
  let replenCrafts = 0;

  if (pick.kind === "adrenaline") adrenCrafts = toMake;
  if (pick.kind === "super") {
    craft("super-adren", toMake, 200);
    adrenCrafts = whole(mixesFromDoses(toMake * 3, doses(stock, "adren4", "adren")));
    crystalNeed = toMake;
  }
  if (pick.kind === "enhanced") {
    craft("enhanced", toMake, 256.9);
    replenCrafts = more(toMake, qty(stock, "replen"));
    craft("replen", replenCrafts, 256.9);
    adrenCrafts = whole(mixesFromDoses(replenCrafts * 4, doses(stock, "adren4", "adren")));
    restoreCrafts = whole(mixesFromDoses(replenCrafts * 4, doses(stock, "restore4", "restore")));
    add("flask", replenCrafts);
    crystalNeed = toMake;
  }
  if (pick.kind === "renewal") {
    const roar = lv >= 119 ? 1 : 2;
    const dose = lv >= 119 ? 3 : 4;
    const fromEnhanced = Math.min(toMake, qty(stock, "enhanced"));
    const fromSuper = toMake - fromEnhanced;
    const renewalXp = fromEnhanced * 1243 + fromSuper * 1700;
    crafts.push({ id: "renewal", count: toMake, xp: renewalXp });
    xp += renewalXp;
    add("roar", toMake * roar);
    add("arbuck", toMake);
    extractNeed += toMake;
    const superCrafts = whole(mixesFromDoses(fromSuper * dose, doses(stock, "super-adren4", "super-adren")));
    craft("super-adren", superCrafts, 200);
    adrenCrafts = whole(mixesFromDoses(superCrafts * 3, doses(stock, "adren4", "adren")));
    crystalNeed = superCrafts;
  }

  craft("adren", adrenCrafts, 200);
  const energyCrafts = more(adrenCrafts, qty(stock, "energy"));
  craft("energy", energyCrafts, 117.5);
  add("papaya", adrenCrafts);
  const avUnf = more(energyCrafts, qty(stock, "avantoe-unf"));
  craft("avantoe-unf", avUnf, 1);
  add("avantoe", avUnf);
  add("fungus", energyCrafts);
  add("water", avUnf);

  craft("restore", restoreCrafts, 142.5);
  const snapUnf = more(restoreCrafts, qty(stock, "snap-unf"));
  craft("snap-unf", snapUnf, 1);
  add("snapdragon", snapUnf);
  add("eggs", restoreCrafts);
  add("water", snapUnf);

  const crystalCrafts = more(crystalNeed, qty(stock, "crystal"));
  if (lv >= 93) {
    craft("crystal", crystalCrafts, 10);
    add("inert", crystalCrafts);
    add("chitin", crystalCrafts);
    extractNeed += crystalCrafts;
  } else add("crystal", crystalCrafts);

  const extractCrafts = more(extractNeed, qty(stock, "extract"));
  craft("extract", extractCrafts, EXTRACT_XP);
  add("pulp", extractCrafts);
  add("vial", extractCrafts);
  return finish(xp, crafts, need, stock);
}

const ENERGIES: { id: string; cost: number }[] = [
  { id: "pale", cost: 2000 },
  { id: "flickering", cost: 1000 },
  { id: "bright", cost: 900 },
  { id: "glowing", cost: 850 },
  { id: "sparkling", cost: 800 },
  { id: "gleaming", cost: 700 },
  { id: "vibrant", cost: 650 },
  { id: "lustrous", cost: 550 },
  { id: "en-elder", cost: 500 },
  { id: "brilliant", cost: 450 },
  { id: "radiant", cost: 400 },
  { id: "luminous", cost: 350 },
  { id: "incandescent", cost: 225 },
  { id: "ancestral", cost: 100 },
];

export function planCharges(goal: number, stock: Stock): Plan {
  const toMake = more(Math.floor(goal), qty(stock, "charge"));
  if (toMake === 0) return EMPTY;
  const need = new Map<string, number>();
  let left = toMake;
  for (const energy of ENERGIES) {
    const have = qty(stock, energy.id);
    const use = Math.min(left, Math.floor(have / energy.cost));
    if (use > 0) need.set(energy.id, use * energy.cost);
    left -= use;
  }
  for (const energy of ENERGIES) {
    if (left <= 0) break;
    const have = qty(stock, energy.id);
    if (have % energy.cost === 0) continue;
    need.set(energy.id, (need.get(energy.id) ?? 0) + energy.cost);
    left -= 1;
  }
  if (left > 0) {
    let best = ENERGIES.find((energy) => energy.id === "incandescent")!;
    let bestUnits = 0;
    for (const energy of ENERGIES) {
      const units = qty(stock, energy.id) / energy.cost;
      if (units > bestUnits) {
        best = energy;
        bestUnits = units;
      }
    }
    need.set(best.id, (need.get(best.id) ?? 0) + left * best.cost);
  }
  need.set("parts", toMake * 20);
  return finish(220 * toMake, [{ id: "charge", count: toMake, xp: 220 * toMake }], need, stock);
}

function bill(plan: Plan): Record<string, number> {
  return Object.fromEntries(plan.missing.map((line) => [line.id, line.count]));
}

function selfCheck() {
  const one = planVuln(1, {}, 103);
  const base = bill(one);
  if (base.soul !== 5 || base.chaos !== 5 || base.roar !== 2 || base.dwarf !== 1 || base["bomb-vial"] !== 1) {
    throw new Error(`vuln base ${JSON.stringify(base)}`);
  }
  if (base.pulp !== 1 || base.vial !== 1) throw new Error("vuln extract");
  if (one.xp !== 1245) throw new Error(`vuln xp ${one.xp}`);
  const plus = bill(planVuln(1, {}, 107));
  if (plus.soul !== 3 || plus.chaos !== 3 || plus.roar !== 1) throw new Error(`vuln +2 ${JSON.stringify(plus)}`);
  if (bill(planVuln(1, {}, 105)).roar !== 2) throw new Error("vuln +1 ingredients");
  if (planVuln(1, { vuln: 2 }, 99).crafts.length !== 0) throw new Error("under level still crafts");
  if (maxMade(2, false, (n) => planVuln(n, { vuln: 2 }, 99)) !== 2) throw new Error("owned bombs under level");
  const covered = planVuln(1, { extract: 1, "bomb-vial": 1, dwarf: 1, soul: 3, chaos: 3, roar: 1 }, 107);
  if (covered.missing.length !== 0 || covered.xp !== 1100) throw new Error(`covered bomb ${covered.xp}`);

  const low = planVitality(1, {}, 105);
  const lowBill = bill(low);
  if (lowBill.slime !== 2 || lowBill.toadflax !== 2 || lowBill.nest !== 2 || lowBill.water !== 2) {
    throw new Error(`vitality base ${JSON.stringify(lowBill)}`);
  }
  if (low.xp !== 1657) throw new Error(`vitality base xp ${low.xp}`);
  const high = planVitality(1, {}, 109);
  const highBill = bill(high);
  if (highBill.slime !== 1 || highBill.toadflax !== 1 || highBill.nest !== 1) throw new Error(`vitality +2 ${JSON.stringify(highBill)}`);
  if (high.xp !== 1476) throw new Error(`vitality +2 xp ${high.xp}`);
  if (bill(planVitality(1, {}, 107)).slime !== 2) throw new Error("vitality +1 ingredients");
  const ownedBrew = planVitality(1, { brew4: 1, extract: 1, "pb-vial": 1, slime: 2, rocktail: 1 }, 105);
  if (ownedBrew.missing.length !== 0 || ownedBrew.xp !== 1150) throw new Error("brew (4) should cover the base recipe");
  const shortBrew = bill(planVitality(1, { brew: 1, extract: 1 }, 105));
  if (shortBrew.toadflax !== 1 || shortBrew.nest !== 1 || shortBrew.slime !== 2) throw new Error(`partial brew ${JSON.stringify(shortBrew)}`);
  const two = planVitality(2, {}, 105);
  if (bill(two).toadflax !== 3 || two.xp !== 3133) throw new Error(`two vitality ${two.xp} ${bill(two).toadflax}`);
  if (vitalityRecipe(104) !== null || vulnRecipe(102) !== null) throw new Error("boost threshold");
  if (maxMade(0, true, (n) => planVitality(n, { vitality: 3 }, 109)) !== 3) throw new Error("owned vitality");

  const poison = planPoison(1, {}, 100);
  const poisonBill = bill(poison);
  if (poisonBill.coconut !== 1 || poisonBill.nightshade !== 1 || poisonBill.ivy !== 1 || poisonBill.slime !== 1) {
    throw new Error(`poison ${JSON.stringify(poisonBill)}`);
  }
  if (poison.xp !== 1036) throw new Error(`poison xp ${poison.xp}`);
  if (planPoison(1, { wpp2: 1, extract: 1, slime: 1 }, 100).xp !== 700) throw new Error("owned weapon poison++");
  if (planPoison(1, { "wpp2-4": 1, extract: 1, slime: 1 }, 100).missing.some((line) => line.id === "ivy")) {
    throw new Error("a 4-dose ++ covers one +++");
  }
  if (planPoison(1, {}, 99).crafts.length !== 0) throw new Error("poison under 100");

  if (adrenPick(83) !== null) throw new Error("83 can make adrenaline");
  const basic = planAdrenaline(1, {}, 84);
  const basicBill = bill(basic);
  if (basicBill.papaya !== 1 || basicBill.avantoe !== 1 || basicBill.fungus !== 1 || basicBill.water !== 1) {
    throw new Error(`adrenaline 84 ${JSON.stringify(basicBill)}`);
  }
  if (Math.abs(basic.xp - 318.5) > 1e-6) throw new Error(`adrenaline xp ${basic.xp}`);
  const superBill = bill(planAdrenaline(1, {}, 87));
  if (superBill.crystal !== 1 || superBill.papaya !== 1 || planAdrenaline(1, {}, 87).crafts.some((line) => line.id === "inert")) {
    throw new Error(`super adrenaline ${JSON.stringify(superBill)}`);
  }
  if (Math.abs(planAdrenaline(1, {}, 87).xp - 518.5) > 1e-6) throw new Error("super xp");
  const enhanced = planAdrenaline(1, {}, 90);
  const enhancedBill = bill(enhanced);
  if (enhancedBill.papaya !== 2 || enhancedBill.eggs !== 2 || enhancedBill.flask !== 1 || enhancedBill.crystal !== 1) {
    throw new Error(`enhanced ${JSON.stringify(enhancedBill)}`);
  }
  if (Math.abs(enhanced.xp - 1437.8) > 1e-4) throw new Error(`enhanced xp ${enhanced.xp}`);
  const renewal = planAdrenaline(1, {}, 115);
  const renewalBill = bill(renewal);
  if (renewalBill.roar !== 2 || renewalBill.arbuck !== 1 || renewalBill.papaya !== 2 || renewalBill.inert !== 2 || renewalBill.pulp !== 3) {
    throw new Error(`renewal ${JSON.stringify(renewalBill)}`);
  }
  if (renewal.xp !== 3192) throw new Error(`renewal xp ${renewal.xp}`);
  const plus2 = bill(planAdrenaline(1, {}, 119));
  if (plus2.roar !== 1 || plus2.papaya !== 1 || plus2.pulp !== 2) throw new Error(`renewal +2 ${JSON.stringify(plus2)}`);
  const fromEnhanced = planAdrenaline(1, { enhanced: 1 }, 115);
  if (fromEnhanced.xp !== 1388 || bill(fromEnhanced).roar !== 2 || bill(fromEnhanced).papaya) {
    throw new Error(`renewal from enhanced ${fromEnhanced.xp} ${JSON.stringify(bill(fromEnhanced))}`);
  }

  if (planCharges(1, { incandescent: 225, parts: 20 }).missing.length !== 0) throw new Error("one charge");
  if (planCharges(1, { incandescent: 225, parts: 20 }).xp !== 220) throw new Error("charge xp");
  const shortCharge = bill(planCharges(1, { incandescent: 200 }));
  if (shortCharge.incandescent !== 25 || shortCharge.parts !== 20) throw new Error(`short charge ${JSON.stringify(shortCharge)}`);
  if (planCharges(2, { "en-elder": 500, ancestral: 100, parts: 40 }).missing.length !== 0) throw new Error("mixed energy");
  const moreElder = bill(planCharges(2, { "en-elder": 500, parts: 40 }));
  if (moreElder["en-elder"] !== 500 || moreElder.parts) throw new Error(`more elder energy ${JSON.stringify(moreElder)}`);
  if (maxMade(0, true, (n) => planCharges(n, { charge: 4 })) !== 4) throw new Error("owned charges");

  const charm = planCharming(1, {}, 102);
  const charmBill = bill(charm);
  if (charmBill.gold !== 4 || charmBill.green !== 4 || charmBill.crimson !== 4 || charmBill.blue !== 4 || charmBill.chitin !== 1) {
    throw new Error(`charming ${JSON.stringify(charmBill)}`);
  }
  if (charmBill.pulp !== 1 || charmBill.vial !== 1 || charm.xp !== 1145) throw new Error(`charming xp ${charm.xp}`);
  const charmOwned = planCharming(1, { extract: 1, chitin: 1, gold: 4, green: 4, crimson: 4, blue: 4 }, 102);
  if (charmOwned.missing.length !== 0 || charmOwned.xp !== 1000) throw new Error("covered charming");
  if (planCharming(1, { charming4: 1 }, 102).crafts.length !== 0) throw new Error("a (4) covers one (3)");
  const charmShort = bill(planCharming(2, { charming4: 1 }, 102));
  if (charmShort.gold !== 4 || charmShort.chitin !== 1 || charmShort.pulp !== 1) throw new Error(`partial charming ${JSON.stringify(charmShort)}`);
  if (planCharming(1, {}, 101).crafts.length !== 0) throw new Error("charming under 102");
  if (maxMade(charmingHeld({ charming: 2 }), false, (n) => planCharming(n, { charming: 2 }, 101)) !== 2) throw new Error("owned charming under level");
  if (charmingHeld({ charming4: 1, charming: 2 }) !== 3) throw new Error("charming doses");
  if (bill(planCharming(1, { gold: 3 }, 102)).gold !== 1) throw new Error("short gold charms");
}

selfCheck();
