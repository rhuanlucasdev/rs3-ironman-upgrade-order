import type { Stock } from "./calc";
import {
  INCENSE,
  RUNES,
  incenseAt,
  incenseOpen,
  planBow,
  planIncense,
  planMagic,
  planRanged,
  planRune,
  planSword,
  runeAt,
  runesMade,
  runesOpen,
} from "./craft";
import { Fields, Picker, type Field } from "./fields";
import { maxMade } from "./recipes";
import { useChoice, useLevel } from "./storage";

function row(group: string, items: [string, string][]): Field[] {
  return items.map(([id, label]) => ({ id, label, group }));
}

const rangedFields: Field[] = [
  ...row("pieces", [
    ["mw-r-body", "Masterwork ranged body"],
    ["mw-r-legs", "Masterwork ranged chaps"],
    ["mw-r-cowl", "Masterwork ranged cowl"],
    ["mw-r-hands", "Masterwork ranged vambraces"],
    ["mw-r-boots", "Masterwork ranged boots"],
  ]),
  ...row("made", [
    ["mw-mono", "Monochromatic dragon leather"],
    ["mw-elastic", "Elasticated leather"],
    ["mw-chromatic", "Chromatic dragon leather"],
    ["mw-plate-r", "Ethereal draconic plate"],
    ["mw-sinew", "Masterwork sinew"],
    ["mw-thread", "Masterwork thread"],
    ["algarum", "Algarum thread"],
    ["sirenic", "Sirenic essence"],
    ["praesul-r", "Praesulic essence (ranged)"],
    ["glorious", "Glorious bar"],
    ["shards", "Draconic shards"],
    ["visage", "Draconic visage"],
    ["lacquer", "Lacquer"],
    ["apex-leather", "Apex leather"],
  ]),
  ...row("leather", [
    ["black-leather", "Black dragon leather"],
    ["royal-leather", "Royal dragon leather"],
    ["undead-leather", "Undead dragon leather"],
    ["dino-leather", "Dinosaur leather"],
    ["green-leather", "Green dragon leather"],
    ["blue-leather", "Blue dragon leather"],
    ["red-leather", "Red dragon leather"],
    ["hard-leather", "Hard leather"],
    ["leather", "Leather"],
    ["snakeskin", "Snakeskin"],
    ["carapace", "Carapace"],
    ["dagannoth", "Dagannoth hide"],
  ]),
  ...row("thread", [
    ["thread", "Thread"],
    ["wool-fall", "Fallfaced wool"],
    ["wool-spring", "Springsheared wool"],
    ["wool-summer", "Summerdown wool"],
    ["wool-winter", "Winterwold wool"],
    ["sinew", "Sinew"],
    ["apex-sinew", "Apex sinew"],
    ["sirenic-scale", "Sirenic scale"],
  ]),
];

const magicFields: Field[] = [
  ...row("pieces", [
    ["mw-m-top", "Masterwork magic robe top"],
    ["mw-m-legs", "Masterwork magic robe bottom"],
    ["mw-m-hat", "Masterwork magic hat"],
    ["mw-m-gloves", "Masterwork magic gloves"],
    ["mw-m-boots", "Masterwork magic boots"],
  ]),
  ...row("made", [
    ["mw-white", "Masterwork white cloth"],
    ["mw-blue", "Masterwork blue cloth"],
    ["mw-green", "Masterwork green cloth"],
    ["mw-plate-m", "Ethereal pearlescent plate"],
    ["mw-thread", "Masterwork thread"],
    ["stone", "Stone of binding"],
    ["tect-essence", "Tectonic essence"],
    ["praesul-m", "Praesulic essence (magic)"],
    ["pearl", "Pearls"],
    ["platinum", "Platinum bar"],
    ["undead-leather", "Undead dragon leather"],
    ["dye", "Brown dye"],
    ["starbloom-cloth", "Starbloom cloth"],
    ["strip", "Strip of cloth"],
  ]),
  ...row("raw", [
    ["flakes", "Croesus flakes"],
    ["flower", "Starbloom flower"],
    ["fungal", "Fungal flake"],
    ["grifolic", "Grifolic flake"],
    ["ganodermic", "Ganodermic flake"],
    ["wool", "Ball of wool"],
    ["imphide", "Imphide"],
    ["silk", "Spider silk"],
    ["batwing", "Batwing"],
    ["mystic", "Mystic cloth"],
    ["bark", "Bark"],
    ["fine", "Fine cloth"],
    ["tectonic", "Tectonic energy"],
    ["thread", "Thread"],
    ["wool-fall", "Fallfaced wool"],
    ["wool-spring", "Springsheared wool"],
    ["wool-summer", "Summerdown wool"],
    ["wool-winter", "Winterwold wool"],
  ]),
];

const swordFields: Field[] = [
  ...row("made", [
    ["mw-sword", "Masterwork 2h sword"],
    ["mw-hilt", "Masterwork sword hilt"],
    ["mw-blade", "Sharpened masterwork blade"],
    ["primed", "Primed glorious bar"],
  ]),
  ...row("bars", [
    ["glorious", "Glorious bar"],
    ["primal", "Primal bar"],
    ["gold-bar", "Gold bar"],
    ["moonstone", "Moonstone"],
    ["undead-leather", "Undead dragon leather"],
    ["dye", "Brown dye"],
  ]),
  ...row("essence", [
    ["chaotic", "Chaotic essence"],
    ["chaotic-wep", "Chaotic melee weapon"],
    ["demonic", "Demonic essence"],
    ["fury-blade", "Blade of Nymora or Avaryss"],
    ["kalphite", "Kalphite essence"],
    ["drygore", "Drygore weapon"],
  ]),
];

const bowFields: Field[] = [
  ...row("made", [["mw-bow", "Masterwork bow"]]),
  ...row("bars", [
    ["glorious", "Glorious bar"],
    ["gold-bar", "Gold bar"],
    ["steel-bar", "Steel bar"],
    ["undead-leather", "Undead dragon leather"],
    ["dye", "Brown dye"],
    ["sapphire", "Sapphire"],
    ["noxious", "Noxious essence"],
    ["nox-weapon", "Noxious weapon"],
    ["ascended", "Ascended essence"],
    ["asc-bow", "Ascension crossbow"],
    ["wax", "Bucket of wax"],
    ["bucket-water", "Bucket of water"],
    ["magic-string", "Magic string"],
    ["branch", "Perfect eternal magic branch"],
    ["sap", "Eternal magic sap"],
    ["mud", "Ground mud runes"],
    ["miasma", "Ground miasma rune"],
  ]),
  ...row("logs", [
    ["log", "Logs"],
    ["oak", "Oak logs"],
    ["willow", "Willow logs"],
    ["teak", "Teak logs"],
    ["maple", "Maple logs"],
    ["acadia-log", "Acadia logs"],
    ["mahogany", "Mahogany logs"],
    ["yew", "Yew logs"],
    ["magic-log", "Magic logs"],
    ["elder-log", "Elder logs"],
    ["eternal-log", "Eternal magic logs"],
  ]),
];

const SET_GROUPS = [
  { id: "pieces", title: "Pieces you have" },
  { id: "made", title: "Components you have" },
  { id: "leather", title: "Leather" },
  { id: "thread", title: "Thread, sinew, and scales" },
  { id: "raw", title: "Cloth, wool, and energy" },
];

export function RangedArmour() {
  return (
    <Fields
      storageKey="mw-ranged-calc-v1"
      title="Masterwork ranged armour"
      unit="Masterwork ranged set"
      goalLabel="Sets you want"
      xpHeading="Crafting XP"
      guide="A set is the cowl, body, chaps, vambraces, and boots. Enter pieces and components you already have. The total is how many full sets that stock finishes."
      note="One set is 110 Crafting, after It Should Have Been Called Chinskin. The cape is not included. A draconic visage covers 120 shards. Sirenic essence you already have is used before sirenic scales. Masterwork thread is made in batches of 10, and sinew in batches of 5, with the last batch rounded up. Glorious bars, lacquer, apex leather, and praesulic essence stay as they are. Recipes follow the RuneScape Wiki."
      groups={SET_GROUPS}
      fields={rangedFields}
      planFor={(goal, stock) => planRanged(goal, stock)}
      maxFor={(stock) => maxMade(0, true, (goal) => planRanged(goal, stock))}
    />
  );
}

export function MagicArmour() {
  return (
    <Fields
      storageKey="mw-magic-calc-v1"
      title="Masterwork magic armour"
      unit="Masterwork magic set"
      goalLabel="Sets you want"
      xpHeading="Crafting XP"
      guide="A set is the hat, robe top, robe bottom, gloves, and boots. Enter pieces and components you already have. The total is how many full sets that stock finishes."
      note="One set is 110 Crafting, after It Should Have Been Called Ancestral. Tectonic essence you already have is used before tectonic energy. Praesulic essence comes from Virtus. Pearls and the cloth chain are included. Masterwork thread is made in batches of 10, and tectonic essence in pairs, with the last batch rounded up. Recipes follow the RuneScape Wiki."
      groups={SET_GROUPS}
      fields={magicFields}
      planFor={(goal, stock) => planMagic(goal, stock)}
      maxFor={(stock) => maxMade(0, true, (goal) => planMagic(goal, stock))}
    />
  );
}

export function MasterworkSword() {
  return (
    <Fields
      storageKey="mw-sword-calc-v1"
      title="Masterwork sword"
      unit="Masterwork 2h sword"
      goalLabel="Swords you want"
      xpHeading="Smithing XP"
      guide="Enter a hilt, a sharpened blade, or the bars and essences you already have. A chaotic weapon, a Twin Furies blade, or a drygore covers two of that essence."
      note="The sword is 110 Smithing, after It Still Should Have Been Called Aetherium. One sword is 10 primed glorious bars, and each primed bar is 1 glorious bar and 100 primal bars, plus 1 primal bar for the trim. The Smithing XP shown is the final combine. The earlier steps are smithing progress. A whetstone or an armour stand sharpens the blade and is not counted here. Recipes follow the RuneScape Wiki."
      groups={[
        { id: "made", title: "Already made" },
        { id: "bars", title: "Bars and fittings" },
        { id: "essence", title: "Essence", note: "One weapon breaks down into 2 essence." },
      ]}
      fields={swordFields}
      planFor={(goal, stock) => planSword(goal, stock)}
      maxFor={(stock) => maxMade(0, true, (goal) => planSword(goal, stock))}
    />
  );
}

export function MasterworkBow() {
  return (
    <Fields
      storageKey="mw-bow-calc-v1"
      title="Masterwork bow"
      unit="Masterwork bow"
      goalLabel="Bows you want"
      xpHeading="Fletching XP"
      guide="Enter the branches, bars, logs, and essences you already have. A noxious weapon or an ascension crossbow covers two of that essence."
      note="The bow is 110 Fletching, after Fletch Quest. One bow uses 200 of each log, from normal logs through eternal magic, plus 7 glorious bars and 14 gold bars. The Fletching XP shown is the tillering step. Stringing and the wood blocks take time on top of that. Recipes follow the RuneScape Wiki."
      groups={[
        { id: "made", title: "Already made" },
        { id: "bars", title: "Bars, gems, and fittings" },
        { id: "logs", title: "Logs", note: "200 of each log make the shavings for one bow." },
      ]}
      fields={bowFields}
      planFor={(goal, stock) => planBow(goal, stock)}
      maxFor={(stock) => maxMade(0, true, (goal) => planBow(goal, stock))}
    />
  );
}

const runeFields: Field[] = [
  ...row("essence", [
    ["pure", "Pure essence"],
    ["exalted", "Exalted essence"],
    ["impure", "Impure essence"],
  ]),
  ...row(
    "runes",
    RUNES.map((rune) => [rune.id, `${rune.name} rune`]),
  ),
];

export function RunesCalc() {
  const [level, setLevel] = useLevel("rc-level-v1");
  const levelN = level === "" ? 0 : Number(level);
  const open = runesOpen(levelN);
  const [chosen, setChosen] = useChoice("rune-which-v1", open, "soul");
  const rune = runeAt(levelN, chosen);
  return (
    <Fields
      storageKey="runes-calc-v1"
      title="Runes"
      unit={rune ? `${rune.name} rune` : "Rune"}
      goalLabel={rune ? `${rune.name} runes you want` : "Runes you want"}
      xpHeading="Runecrafting XP"
      levelLabel="Your Runecrafting level"
      guide="Enter your Runecrafting level and the essence you have. Pick a rune. The total is how many of that rune the essence finishes. Exalted essence is used before pure essence."
      note="The multiple is the guaranteed one for your level. The level before a multiple can still give an extra rune, and that chance is not counted. Boosts, powerburst of sorcery, anima stones, and ethereal outfits are not counted. Soul runes need 4 pure essence for one charge, and 5 charges make 12 runes if the binding succeeds. A failed charge still gives the XP and no runes. From 105 the soul binding XP is tripled. Exalted essence does not make soul runes. Necrotic runes use impure essence. Recipes follow the RuneScape Wiki."
      groups={[
        { id: "essence", title: "Essence" },
        { id: "runes", title: "Runes you already have" },
      ]}
      fields={runeFields}
      shown={(field) => field.group === "essence" || field.id === chosen}
      level={level}
      onLevel={setLevel}
      toolbar={<Picker label="Runes" options={open} chosen={chosen} onPick={setChosen} />}
      recipe={rune ? `${rune.name} rune, level ${rune.level}. ${rune.id === "soul" ? "4 pure essence make 2.4 soul runes." : `${rune.multiple} per essence.`}` : null}
      blocked={levelN === 0 ? "Enter your Runecrafting level." : open.length === 0 ? "That level cannot craft these runes." : null}
      planFor={(goal, stock) => planRune(goal, stock, levelN, chosen)}
      maxFor={(stock: Stock) => runesMade(stock, levelN, chosen)}
    />
  );
}

const incenseFields: Field[] = [
  ...new Map(
    [
      ...INCENSE.flatMap((stick) => [
        [stick.id, `${stick.name} incense sticks`, "made"],
        [stick.wood, "Wooden incense sticks", "made"],
        [stick.ashy, "Ashy incense sticks", "made"],
        [stick.herb, `Clean ${stick.name.toLowerCase()}`, "herbs"],
      ] as [string, string, string][]),
    ].map(([id, label, group]) => [id, { id, label, group }]),
  ).values(),
  ...row("logs", [
    ["log", "Logs"],
    ["oak", "Oak logs"],
    ["willow", "Willow logs"],
    ["maple", "Maple logs"],
    ["acadia-log", "Acadia logs"],
    ["yew", "Yew logs"],
    ["magic-log", "Magic logs"],
  ]),
  ...row("ash", [
    ["impious", "Impious ashes"],
    ["accursed", "Accursed ashes"],
    ["infernal", "Infernal ashes"],
  ]),
];

export function IncenseCalc() {
  const [level, setLevel] = useLevel("fm-level-v1");
  const levelN = level === "" ? 0 : Number(level);
  const open = incenseOpen(levelN);
  const [chosen, setChosen] = useChoice("incense-which-v1", open, "inc-lantadyme");
  const stick = incenseAt(levelN, chosen);
  const visible = new Set(stick ? [stick.id, stick.wood, stick.ashy, stick.log, stick.ash, stick.herb] : []);
  return (
    <Fields
      storageKey="incense-calc-v1"
      title="Incense sticks"
      unit={stick ? `${stick.name} incense sticks` : "Incense sticks"}
      goalLabel={stick ? `${stick.name} incense sticks you want` : "Incense sticks you want"}
      xpHeading="Firemaking XP"
      levelLabel="Your Firemaking level"
      guide="Enter your Firemaking level and pick a stick. Two logs make one wooden stick, two ashes coat it, and one clean herb finishes it."
      note="Lantadyme sticks add up to 2 minutes to potions that already last 6 minutes or more. Coating the sticks also gives Prayer XP: 8 for impious ashes, 25 for accursed ashes, and 100 for infernal ashes. Makes-cense and Quick-cense are not counted. Boosts do not count. Recipes follow the RuneScape Wiki."
      groups={[
        { id: "made", title: "Already made", note: "Wooden and ashy sticks match the log used for this incense." },
        { id: "logs", title: "Logs" },
        { id: "ash", title: "Ashes" },
        { id: "herbs", title: "Herb" },
      ]}
      fields={incenseFields}
      shown={(field) => visible.has(field.id)}
      level={level}
      onLevel={setLevel}
      toolbar={<Picker label="Incense sticks" options={open} chosen={chosen} onPick={setChosen} />}
      recipe={
        stick
          ? `${stick.name} incense, level ${stick.level}. Two logs, two ashes, and one clean herb. The ashes give ${stick.prayer} Prayer XP.`
          : null
      }
      blocked={levelN === 0 ? "Enter your Firemaking level." : null}
      planFor={(goal, stock) => planIncense(goal, stock, levelN, chosen)}
      maxFor={(stock) => maxMade(0, levelN > 0 && stick !== null, (goal) => planIncense(goal, stock, levelN, chosen))}
    />
  );
}
