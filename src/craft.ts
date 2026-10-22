/**
 * Masterwork armour and weapons, runes, and incense sticks.
 * Bills follow the RuneScape Wiki (Oct 2026). Partial batches round up.
 * Boosts, anima stones, outfits, and Makes-cense are not counted.
 */

import type { Line, Plan, Stock } from "./calc";

const EMPTY: Plan = { xp: 0, crafts: [], missing: [] };

function qty(stock: Stock, id: string): number {
  const n = stock[id] ?? 0;
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n);
}

function more(need: number, have: number): number {
  const left = need - have;
  return left > 1e-6 ? left : 0;
}

type Need = Map<string, number>;

function add(need: Need, id: string, count: number) {
  if (count > 0) need.set(id, (need.get(id) ?? 0) + count);
}

function consume(need: Need, stock: Stock) {
  for (const [id, count] of [...need]) {
    const left = more(count, qty(stock, id));
    if (left === 0) need.delete(id);
    else need.set(id, left);
  }
}

function expand(need: Need, id: string, batch: number, per: Record<string, number>) {
  const count = need.get(id) ?? 0;
  if (count <= 0) return;
  const batches = Math.ceil(count / batch);
  need.delete(id);
  for (const [part, each] of Object.entries(per)) add(need, part, each * batches);
}

function credit(need: Need, id: string, covered: number) {
  const left = more(need.get(id) ?? 0, covered);
  if (left === 0) need.delete(id);
  else need.set(id, left);
}

function finish(xp: number, need: Need): Plan {
  const missing: Line[] = [...need].filter(([, count]) => count > 0).map(([id, count]) => ({ id, count, xp: 0 }));
  return { xp, crafts: [], missing };
}

type Piece = { id: string; xp: number; parts: Record<string, number> };

function piecesNeeded(goal: number, stock: Stock, pieces: Piece[]): { xp: number; need: Need } {
  const need: Need = new Map();
  let xp = 0;
  const sets = Math.floor(goal);
  for (const piece of pieces) {
    const count = more(sets, qty(stock, piece.id));
    if (count === 0) continue;
    xp += piece.xp * count;
    for (const [id, each] of Object.entries(piece.parts)) add(need, id, each * count);
  }
  return { xp, need };
}

const RANGED: Piece[] = [
  { id: "mw-r-body", xp: 13200, parts: { "mw-mono": 10, "mw-elastic": 3, "mw-plate-r": 5, "mw-sinew": 500, algarum: 1 } },
  { id: "mw-r-legs", xp: 7920, parts: { "mw-mono": 5, "mw-elastic": 2, "mw-plate-r": 3, "mw-sinew": 300, algarum: 1 } },
  { id: "mw-r-cowl", xp: 5280, parts: { "mw-mono": 3, "mw-elastic": 2, "mw-chromatic": 1, "mw-plate-r": 2, "mw-sinew": 200, algarum: 1 } },
  { id: "mw-r-boots", xp: 2640, parts: { "mw-mono": 1, "mw-elastic": 1, "mw-plate-r": 1, "mw-sinew": 100, algarum: 1 } },
  { id: "mw-r-hands", xp: 2640, parts: { "mw-mono": 1, "mw-elastic": 1, "mw-plate-r": 1, "mw-sinew": 100, algarum: 1 } },
];

const MAGIC: Piece[] = [
  { id: "mw-m-top", xp: 13200, parts: { "mw-white": 10, "mw-blue": 3, "mw-plate-m": 5, "mw-thread": 500, stone: 1 } },
  { id: "mw-m-legs", xp: 7920, parts: { "mw-white": 5, "mw-blue": 2, "mw-plate-m": 3, "mw-thread": 300, stone: 1 } },
  { id: "mw-m-hat", xp: 5280, parts: { "mw-white": 3, "mw-blue": 2, "mw-green": 1, "mw-plate-m": 2, "mw-thread": 200, stone: 1 } },
  { id: "mw-m-boots", xp: 2640, parts: { "mw-white": 1, "mw-blue": 1, "mw-plate-m": 1, "mw-thread": 100, stone: 1 } },
  { id: "mw-m-gloves", xp: 2640, parts: { "mw-white": 1, "mw-blue": 1, "mw-plate-m": 1, "mw-thread": 100, stone: 1 } },
];

const WOOL = { "wool-fall": 1, "wool-spring": 1, "wool-summer": 1, "wool-winter": 1, thread: 10 };

export function planRanged(goal: number, stock: Stock): Plan {
  if (Math.floor(goal) <= 0) return EMPTY;
  const { xp, need } = piecesNeeded(goal, stock, RANGED);
  if (need.size === 0) return { xp, crafts: [], missing: [] };
  consume(need, stock);
  expand(need, "mw-plate-r", 1, { glorious: 1, "praesul-r": 1, sirenic: 1, shards: 10, lacquer: 10, "apex-leather": 10 });
  consume(need, stock);
  credit(need, "shards", qty(stock, "visage") * 120);
  expand(need, "sirenic", 2, { "sirenic-scale": 14, algarum: 1 });
  expand(need, "mw-mono", 1, { "black-leather": 8, "royal-leather": 8, "undead-leather": 8, "dino-leather": 1, "mw-thread": 1 });
  expand(need, "mw-elastic", 1, { snakeskin: 8, carapace: 8, dagannoth: 8, leather: 1, "mw-thread": 1 });
  expand(need, "mw-chromatic", 1, { "green-leather": 8, "blue-leather": 8, "red-leather": 8, "hard-leather": 1, "mw-thread": 1 });
  expand(need, "mw-sinew", 5, { thread: 5, sinew: 1, "apex-sinew": 1 });
  consume(need, stock);
  expand(need, "mw-thread", 10, WOOL);
  consume(need, stock);
  return finish(xp, need);
}

export function planMagic(goal: number, stock: Stock): Plan {
  if (Math.floor(goal) <= 0) return EMPTY;
  const { xp, need } = piecesNeeded(goal, stock, MAGIC);
  if (need.size === 0) return { xp, crafts: [], missing: [] };
  consume(need, stock);
  expand(need, "mw-plate-m", 1, { "tect-essence": 1, "praesul-m": 1, pearl: 5, platinum: 10, "undead-leather": 1, dye: 1 });
  consume(need, stock);
  expand(need, "tect-essence", 2, { tectonic: 14, stone: 1 });
  expand(need, "mw-white", 1, { flakes: 10, "starbloom-cloth": 50 });
  expand(need, "mw-green", 1, { "starbloom-cloth": 10, fungal: 1000, grifolic: 1000, ganodermic: 1000 });
  expand(need, "mw-blue", 1, { strip: 4, imphide: 4, silk: 4, batwing: 4, mystic: 4, bark: 2, fine: 2 });
  consume(need, stock);
  expand(need, "starbloom-cloth", 1, { flower: 2 });
  expand(need, "strip", 1, { wool: 2 });
  expand(need, "mw-thread", 10, WOOL);
  consume(need, stock);
  return finish(xp, need);
}

export function planSword(goal: number, stock: Stock): Plan {
  const make = more(Math.floor(goal), qty(stock, "mw-sword"));
  if (make === 0) return EMPTY;
  const hilts = more(make, qty(stock, "mw-hilt"));
  const blades = more(make, qty(stock, "mw-blade"));
  const need: Need = new Map();
  add(need, "primed", hilts * 5 + blades * 5);
  add(need, "gold-bar", hilts * 10);
  add(need, "moonstone", hilts);
  add(need, "chaotic", hilts * 4);
  add(need, "undead-leather", hilts);
  add(need, "dye", hilts);
  add(need, "primal", blades);
  add(need, "demonic", blades * 4);
  add(need, "kalphite", blades * 4);
  consume(need, stock);
  expand(need, "primed", 1, { glorious: 1, primal: 100 });
  consume(need, stock);
  credit(need, "chaotic", qty(stock, "chaotic-wep") * 2);
  credit(need, "demonic", qty(stock, "fury-blade") * 2);
  credit(need, "kalphite", qty(stock, "drygore") * 2);
  return finish(200 * make, need);
}

const BOW_LOGS = ["log", "oak", "willow", "teak", "maple", "acadia-log", "mahogany", "yew", "magic-log", "elder-log", "eternal-log"];

export function planBow(goal: number, stock: Stock): Plan {
  const make = more(Math.floor(goal), qty(stock, "mw-bow"));
  if (make === 0) return EMPTY;
  const need: Need = new Map();
  add(need, "branch", make * 2);
  add(need, "sap", make * 2);
  add(need, "mud", make * 20);
  add(need, "miasma", make * 20);
  for (const log of BOW_LOGS) add(need, log, make * 200);
  add(need, "glorious", make * 7);
  add(need, "gold-bar", make * 14);
  add(need, "steel-bar", make * 2);
  add(need, "undead-leather", make);
  add(need, "dye", make);
  add(need, "noxious", make * 2);
  add(need, "sapphire", make * 2);
  add(need, "ascended", make * 2);
  add(need, "wax", make);
  add(need, "bucket-water", make);
  add(need, "magic-string", make);
  consume(need, stock);
  credit(need, "noxious", qty(stock, "nox-weapon") * 2);
  credit(need, "ascended", qty(stock, "asc-bow") * 2);
  return finish(160 * make, need);
}

export type RuneChoice = {
  id: string;
  name: string;
  level: number;
  xp: number;
  essence: "pure" | "impure";
  exalted: boolean;
  multiples: number[];
};

export const RUNES: RuneChoice[] = [
  { id: "air", name: "Air", level: 1, xp: 5, essence: "pure", exalted: true, multiples: [1, 11, 22, 33, 44, 55, 66, 77, 88, 99, 110] },
  { id: "mind", name: "Mind", level: 1, xp: 5.5, essence: "pure", exalted: true, multiples: [1, 14, 28, 42, 56, 70, 84, 98] },
  { id: "water", name: "Water", level: 5, xp: 6, essence: "pure", exalted: true, multiples: [5, 19, 38, 57, 76, 95] },
  { id: "earth", name: "Earth", level: 9, xp: 6.5, essence: "pure", exalted: true, multiples: [9, 26, 52, 78, 104] },
  { id: "fire", name: "Fire", level: 14, xp: 7, essence: "pure", exalted: true, multiples: [14, 35, 70, 105] },
  { id: "body", name: "Body", level: 20, xp: 7.5, essence: "pure", exalted: true, multiples: [20, 46, 92] },
  { id: "cosmic", name: "Cosmic", level: 27, xp: 8, essence: "pure", exalted: true, multiples: [27, 59] },
  { id: "chaos", name: "Chaos", level: 35, xp: 8.5, essence: "pure", exalted: true, multiples: [35, 74] },
  { id: "astral", name: "Astral", level: 40, xp: 8.7, essence: "pure", exalted: true, multiples: [40, 82] },
  { id: "nature", name: "Nature", level: 44, xp: 9, essence: "pure", exalted: true, multiples: [44, 91] },
  { id: "law", name: "Law", level: 54, xp: 9.5, essence: "pure", exalted: true, multiples: [54, 110] },
  { id: "death", name: "Death", level: 65, xp: 10, essence: "pure", exalted: true, multiples: [65] },
  { id: "blood-rune", name: "Blood", level: 77, xp: 10.5, essence: "pure", exalted: true, multiples: [77] },
  { id: "soul", name: "Soul", level: 90, xp: 57.5, essence: "pure", exalted: false, multiples: [90] },
  { id: "time", name: "Time", level: 100, xp: 15.5, essence: "pure", exalted: true, multiples: [100] },
  { id: "spirit-rune", name: "Spirit", level: 1, xp: 11, essence: "impure", exalted: false, multiples: [1, 11, 22, 33, 44, 55, 66, 77, 88, 99, 110] },
  { id: "bone", name: "Bone", level: 20, xp: 15, essence: "impure", exalted: false, multiples: [20, 46, 92] },
  { id: "flesh", name: "Flesh", level: 40, xp: 18, essence: "impure", exalted: false, multiples: [40, 82] },
  { id: "miasma-rune", name: "Miasma", level: 60, xp: 20, essence: "impure", exalted: false, multiples: [60] },
];

export function runeAt(level: number, id: string): (RuneChoice & { multiple: number }) | null {
  const rune = RUNES.find((entry) => entry.id === id);
  if (!rune || Math.floor(level) < rune.level) return null;
  const lv = Math.floor(level);
  let multiple = 0;
  rune.multiples.forEach((need, index) => {
    if (lv >= need) multiple = index + 1;
  });
  return { ...rune, multiple };
}

export function runesOpen(level: number): RuneChoice[] {
  return RUNES.filter((rune) => Math.floor(level) >= rune.level);
}

function essenceFor(runes: number, per: number): number {
  if (runes <= 0) return 0;
  return Math.ceil(runes / per);
}

export function planRune(goal: number, stock: Stock, level: number, id: string): Plan {
  const rune = runeAt(level, id);
  if (!rune) return EMPTY;
  const left = more(Math.floor(goal), qty(stock, rune.id));
  if (left === 0) return EMPTY;
  if (rune.id === "soul") {
    const per = 0.6;
    const xpEach = Math.floor(level) >= 105 ? 167.5 : 57.5;
    const need = essenceFor(left, per);
    const owned = qty(stock, "pure");
    const missing = more(need, owned);
    const plan = finish(need * xpEach, new Map(missing > 0 ? [["pure", missing]] : []));
    return plan;
  }
  const perPure = rune.multiple;
  const perEx = rune.exalted ? rune.multiple * 4 : 0;
  let remain = left;
  let exaltedUsed = 0;
  if (perEx > 0) {
    exaltedUsed = Math.min(qty(stock, "exalted"), essenceFor(remain, perEx));
    remain = more(remain, exaltedUsed * perEx);
  }
  const pureUsed = Math.min(qty(stock, rune.essence), essenceFor(remain, perPure));
  remain = more(remain, pureUsed * perPure);
  const short = essenceFor(remain, perPure);
  const xp = exaltedUsed * rune.xp * 3 + (pureUsed + short) * rune.xp;
  if (short === 0) return { xp, crafts: [], missing: [] };
  return finish(xp, new Map([[rune.essence, short]]));
}

export function runesMade(stock: Stock, level: number, id: string): number {
  const rune = runeAt(level, id);
  if (!rune) return qty(stock, id);
  if (rune.id === "soul") return qty(stock, rune.id) + Math.floor(qty(stock, "pure") * 0.6);
  const pure = qty(stock, rune.essence) * rune.multiple;
  const extra = rune.exalted ? qty(stock, "exalted") * rune.multiple * 4 : 0;
  return qty(stock, rune.id) + pure + extra;
}

export type IncenseChoice = {
  id: string;
  name: string;
  level: number;
  log: string;
  ash: string;
  herb: string;
  wood: string;
  ashy: string;
  cut: number;
  herbXp: number;
  prayer: number;
};

export const INCENSE: IncenseChoice[] = [
  { id: "inc-guam", name: "Guam", level: 1, log: "log", ash: "impious", herb: "guam", wood: "stick-log", ashy: "ashy-log", cut: 16, herbXp: 24, prayer: 8 },
  { id: "inc-tarromin", name: "Tarromin", level: 5, log: "log", ash: "impious", herb: "tarromin", wood: "stick-log", ashy: "ashy-log", cut: 16, herbXp: 24, prayer: 8 },
  { id: "inc-marrentill", name: "Marrentill", level: 9, log: "log", ash: "impious", herb: "marrentill", wood: "stick-log", ashy: "ashy-log", cut: 16, herbXp: 24, prayer: 8 },
  { id: "inc-harralander", name: "Harralander", level: 20, log: "oak", ash: "impious", herb: "harralander", wood: "stick-oak", ashy: "ashy-oak", cut: 24, herbXp: 36, prayer: 8 },
  { id: "inc-ranarr", name: "Ranarr", level: 25, log: "oak", ash: "impious", herb: "ranarr", wood: "stick-oak", ashy: "ashy-oak", cut: 24, herbXp: 36, prayer: 8 },
  { id: "inc-toadflax", name: "Toadflax", level: 30, log: "willow", ash: "impious", herb: "toadflax", wood: "stick-willow", ashy: "ashy-willow", cut: 36, herbXp: 54, prayer: 8 },
  { id: "inc-spirit", name: "Spirit weed", level: 35, log: "willow", ash: "impious", herb: "spirit", wood: "stick-willow", ashy: "ashy-willow", cut: 36, herbXp: 54, prayer: 8 },
  { id: "inc-irit", name: "Irit", level: 40, log: "maple", ash: "accursed", herb: "irit", wood: "stick-maple", ashy: "ashy-maple", cut: 54.2, herbXp: 81.3, prayer: 25 },
  { id: "inc-wergali", name: "Wergali", level: 41, log: "maple", ash: "accursed", herb: "wergali", wood: "stick-maple", ashy: "ashy-maple", cut: 54.2, herbXp: 81.3, prayer: 25 },
  { id: "inc-avantoe", name: "Avantoe", level: 48, log: "acadia-log", ash: "accursed", herb: "avantoe", wood: "stick-acadia", ashy: "ashy-acadia", cut: 56, herbXp: 84, prayer: 25 },
  { id: "inc-kwuarm", name: "Kwuarm", level: 54, log: "acadia-log", ash: "accursed", herb: "kwuarm", wood: "stick-acadia", ashy: "ashy-acadia", cut: 56, herbXp: 84, prayer: 25 },
  { id: "inc-bloodweed", name: "Bloodweed", level: 57, log: "acadia-log", ash: "accursed", herb: "bloodweed", wood: "stick-acadia", ashy: "ashy-acadia", cut: 56, herbXp: 84, prayer: 25 },
  { id: "inc-snapdragon", name: "Snapdragon", level: 59, log: "acadia-log", ash: "accursed", herb: "snapdragon", wood: "stick-acadia", ashy: "ashy-acadia", cut: 56, herbXp: 84, prayer: 25 },
  { id: "inc-cadantine", name: "Cadantine", level: 65, log: "yew", ash: "infernal", herb: "cadantine", wood: "stick-yew", ashy: "ashy-yew", cut: 81, herbXp: 121.5, prayer: 100 },
  { id: "inc-lantadyme", name: "Lantadyme", level: 67, log: "yew", ash: "infernal", herb: "lantadyme", wood: "stick-yew", ashy: "ashy-yew", cut: 81, herbXp: 121.5, prayer: 100 },
  { id: "inc-dwarf", name: "Dwarf weed", level: 70, log: "yew", ash: "infernal", herb: "dwarf", wood: "stick-yew", ashy: "ashy-yew", cut: 81, herbXp: 121.5, prayer: 100 },
  { id: "inc-torstol", name: "Torstol", level: 75, log: "magic-log", ash: "infernal", herb: "torstol", wood: "stick-magic", ashy: "ashy-magic", cut: 121.5, herbXp: 182.2, prayer: 100 },
  { id: "inc-fellstalk", name: "Fellstalk", level: 91, log: "magic-log", ash: "infernal", herb: "fellstalk", wood: "stick-magic", ashy: "ashy-magic", cut: 121.5, herbXp: 182.2, prayer: 100 },
];

export function incenseAt(level: number, id: string): IncenseChoice | null {
  const stick = INCENSE.find((entry) => entry.id === id);
  if (!stick || Math.floor(level) < stick.level) return null;
  return stick;
}

export function incenseOpen(level: number): IncenseChoice[] {
  return INCENSE.filter((stick) => Math.floor(level) >= stick.level);
}

export function planIncense(goal: number, stock: Stock, level: number, id: string): Plan {
  const stick = incenseAt(level, id);
  if (!stick) return EMPTY;
  const toMake = more(Math.floor(goal), qty(stock, stick.id));
  if (toMake === 0) return EMPTY;
  const ashy = more(toMake, qty(stock, stick.ashy));
  const wood = more(ashy, qty(stock, stick.wood));
  const need: Need = new Map();
  add(need, stick.log, wood * 2);
  add(need, stick.ash, ashy * 2);
  add(need, stick.herb, toMake);
  consume(need, stock);
  const xp = wood * stick.cut + ashy * stick.cut + toMake * stick.herbXp;
  return finish(xp, need);
}

function bill(plan: Plan): Record<string, number> {
  return Object.fromEntries(plan.missing.map((line) => [line.id, line.count]));
}

function selfCheck() {
  const ranged = bill(planRanged(1, {}));
  if (ranged["black-leather"] !== 160 || ranged["dino-leather"] !== 20 || ranged.snakeskin !== 72 || ranged["green-leather"] !== 8) {
    throw new Error(`ranged leather ${JSON.stringify(ranged)}`);
  }
  if (ranged["wool-fall"] !== 3 || ranged.sinew !== 240 || ranged.thread !== 1230 || ranged.glorious !== 12) {
    throw new Error(`ranged bars ${ranged["wool-fall"]} ${ranged.sinew} ${ranged.thread} ${ranged.glorious}`);
  }
  if (ranged["sirenic-scale"] !== 84 || ranged.algarum !== 11 || ranged.shards !== 120 || ranged["apex-leather"] !== 120) {
    throw new Error(`ranged plate ${JSON.stringify(ranged)}`);
  }
  if (planRanged(1, {}).xp !== 31680) throw new Error("ranged xp");
  const ownedBody = bill(planRanged(1, { "mw-r-body": 1 }));
  if (ownedBody["black-leather"] !== 80) throw new Error(`owned body ${ownedBody["black-leather"]}`);
  if (planRanged(1, { shards: 0, visage: 1, "mw-plate-r": 12, "mw-mono": 20, "mw-elastic": 9, "mw-chromatic": 1, "mw-sinew": 1200, algarum: 5 }).missing.length !== 0) {
    throw new Error("owned ranged components");
  }

  const magic = bill(planMagic(1, {}));
  if (magic.flakes !== 200 || magic.flower !== 2020 || magic.wool !== 72 || magic.tectonic !== 84 || magic.stone !== 11) {
    throw new Error(`magic ${JSON.stringify(magic)}`);
  }
  if (magic.fungal !== 1000 || magic["wool-fall"] !== 120 || magic.thread !== 1200 || magic["praesul-m"] !== 12) {
    throw new Error(`magic cloth ${JSON.stringify(magic)}`);
  }
  if (planMagic(1, {}).xp !== 31680) throw new Error("magic xp");

  const sword = bill(planSword(1, {}));
  if (sword.glorious !== 10 || sword.primal !== 1001 || sword["gold-bar"] !== 10 || sword.chaotic !== 4 || sword["undead-leather"] !== 1) {
    throw new Error(`sword ${JSON.stringify(sword)}`);
  }
  if (planSword(1, {}).xp !== 200) throw new Error("sword xp");
  const hilt = bill(planSword(1, { "mw-hilt": 1 }));
  if (hilt.glorious !== 5 || hilt.primal !== 501 || hilt["gold-bar"] || hilt.demonic !== 4) throw new Error(`hilt owned ${JSON.stringify(hilt)}`);
  if (planSword(1, { "chaotic-wep": 2 }).missing.some((line) => line.id === "chaotic")) throw new Error("chaotic weapons");

  const bow = bill(planBow(1, {}));
  if (bow.glorious !== 7 || bow["gold-bar"] !== 14 || bow["eternal-log"] !== 200 || bow.log !== 200 || bow.mud !== 20 || bow.noxious !== 2) {
    throw new Error(`bow ${JSON.stringify(bow)}`);
  }
  if (planBow(1, {}).xp !== 160) throw new Error("bow xp");
  if (planBow(1, { "nox-weapon": 1 }).missing.some((line) => line.id === "noxious")) throw new Error("noxious weapon");

  const lanta = bill(planIncense(1, {}, 67, "inc-lantadyme"));
  if (lanta.yew !== 2 || lanta.infernal !== 2 || lanta.lantadyme !== 1) throw new Error(`lantadyme ${JSON.stringify(lanta)}`);
  if (planIncense(1, {}, 67, "inc-lantadyme").xp !== 283.5) throw new Error("lantadyme xp");
  const ashy = planIncense(1, { "ashy-yew": 1 }, 67, "inc-lantadyme");
  if (ashy.xp !== 121.5 || bill(ashy).lantadyme !== 1 || bill(ashy).yew) throw new Error("ashy stick");
  if (planIncense(1, {}, 66, "inc-lantadyme").crafts.length !== 0 || planIncense(1, {}, 66, "inc-lantadyme").missing.length !== 0) {
    throw new Error("incense under level");
  }

  if (runesMade({ pure: 10 }, 77, "blood-rune") !== 10) throw new Error("blood runes");
  if (Math.abs(planRune(10, { pure: 10 }, 77, "blood-rune").xp - 105) > 1e-6) throw new Error("blood xp");
  if (runesMade({ pure: 20 }, 90, "soul") !== 12) throw new Error("soul runes");
  const souls = planRune(12, {}, 90, "soul");
  if (bill(souls).pure !== 20 || souls.xp !== 1150) throw new Error(`soul goal ${souls.xp} ${bill(souls).pure}`);
  if (runesMade({ exalted: 1 }, 77, "blood-rune") !== 4) throw new Error("exalted blood");
  if (planRune(4, { exalted: 1 }, 77, "blood-rune").xp !== 31.5) throw new Error("exalted xp");
  if (runesMade({ impure: 5 }, 60, "miasma-rune") !== 5) throw new Error("miasma");
  if (runesMade({ pure: 1 }, 99, "air") !== 10 || runesMade({ pure: 1 }, 110, "air") !== 11) throw new Error("air multiple");
  if (runeAt(89, "soul") !== null) throw new Error("soul before 90");
}

selfCheck();
