import { fieldGroups, fields, maxElders, plan } from "./calc";
import { Fields, type Field } from "./fields";
import { useHerbLevel } from "./storage";
import {
  adrenPick,
  charmingHeld,
  maxMade,
  planAdrenaline,
  planCharges,
  planCharming,
  planPoison,
  planVitality,
  planVuln,
  vitalityRecipe,
  vulnRecipe,
} from "./recipes";

const empty = { xp: 0, crafts: [], missing: [] };

const made = { id: "made", title: "Already made" };
const ingredients = { id: "ingredients", title: "Ingredients" };
const extract = { id: "extract", title: "Primal extract", note: "Used when you still have to mix the extract." };
const doses = { id: "made", title: "Already made", note: "A (4) counts as 4 doses and a (3) as 3." };

const vulnFields: Field[] = [
  { id: "vuln", label: "Vulnerability bomb", group: "made" },
  { id: "extract", label: "Primal extract", group: "made" },
  { id: "bomb-vial", label: "Bomb vial", group: "ingredients" },
  { id: "dwarf", label: "Clean dwarf weed", group: "ingredients" },
  { id: "soul", label: "Soul rune", group: "ingredients" },
  { id: "chaos", label: "Chaos rune", group: "ingredients" },
  { id: "roar", label: "Bottled dinosaur roar", group: "ingredients" },
  { id: "pulp", label: "Primal fruit pulp", group: "extract" },
  { id: "vial", label: "Empty vial", group: "extract" },
];

const vitaFields: Field[] = [
  { id: "vitality", label: "Powerburst of vitality (4)", group: "made" },
  { id: "brew4", label: "Saradomin brew (4)", group: "made" },
  { id: "brew", label: "Saradomin brew (3)", group: "made" },
  { id: "toad-unf", label: "Toadflax potion (unf)", group: "made" },
  { id: "extract", label: "Primal extract", group: "made" },
  { id: "pb-vial", label: "Powerburst vial", group: "ingredients" },
  { id: "slime", label: "Poison slime", group: "ingredients" },
  { id: "rocktail", label: "Rocktail", group: "ingredients" },
  { id: "toadflax", label: "Clean toadflax", group: "brew" },
  { id: "nest", label: "Crushed nest", group: "brew" },
  { id: "water", label: "Vial of water", group: "brew" },
  { id: "pulp", label: "Primal fruit pulp", group: "extract" },
  { id: "vial", label: "Empty vial", group: "extract" },
];

const poisonFields: Field[] = [
  { id: "wpp3", label: "Weapon poison +++ (3)", group: "made" },
  { id: "wpp2-4", label: "Weapon poison ++ (4)", group: "made" },
  { id: "wpp2", label: "Weapon poison ++ (3)", group: "made" },
  { id: "wpp-unf", label: "Weapon poison ++ (unf)", group: "made" },
  { id: "extract", label: "Primal extract", group: "made" },
  { id: "coconut", label: "Coconut milk", group: "ingredients" },
  { id: "nightshade", label: "Cave nightshade", group: "ingredients" },
  { id: "ivy", label: "Poison ivy berries", group: "ingredients" },
  { id: "slime", label: "Poison slime", group: "ingredients" },
  { id: "pulp", label: "Primal fruit pulp", group: "extract" },
  { id: "vial", label: "Empty vial", group: "extract" },
];

const charmingFields: Field[] = [
  { id: "charming4", label: "Charming potion (4)", group: "made" },
  { id: "charming", label: "Charming potion (3)", group: "made" },
  { id: "extract", label: "Primal extract", group: "made" },
  { id: "gold", label: "Gold charm", group: "ingredients" },
  { id: "green", label: "Green charm", group: "ingredients" },
  { id: "crimson", label: "Crimson charm", group: "ingredients" },
  { id: "blue", label: "Blue charm", group: "ingredients" },
  { id: "chitin", label: "Spark chitin", group: "ingredients" },
  { id: "pulp", label: "Primal fruit pulp", group: "extract" },
  { id: "vial", label: "Empty vial", group: "extract" },
];

const adrenFields: Field[] = [
  { id: "renewal", label: "Adrenaline renewal (4)", group: "made" },
  { id: "enhanced", label: "Enhanced replenishment (6)", group: "made" },
  { id: "replen", label: "Replenishment (6)", group: "made" },
  { id: "super-adren4", label: "Super adrenaline (4)", group: "made" },
  { id: "super-adren", label: "Super adrenaline (3)", group: "made" },
  { id: "adren4", label: "Adrenaline potion (4)", group: "made" },
  { id: "adren", label: "Adrenaline potion (3)", group: "made" },
  { id: "energy", label: "Super energy (3)", group: "made" },
  { id: "avantoe-unf", label: "Avantoe potion (unf)", group: "made" },
  { id: "restore4", label: "Super restore (4)", group: "made" },
  { id: "restore", label: "Super restore (3)", group: "made" },
  { id: "snap-unf", label: "Snapdragon potion (unf)", group: "made" },
  { id: "crystal", label: "Adrenaline crystal", group: "made" },
  { id: "extract", label: "Primal extract", group: "made" },
  { id: "papaya", label: "Papaya fruit", group: "ingredients" },
  { id: "avantoe", label: "Clean avantoe", group: "ingredients" },
  { id: "fungus", label: "Mort myre fungus", group: "ingredients" },
  { id: "water", label: "Vial of water", group: "ingredients" },
  { id: "snapdragon", label: "Clean snapdragon", group: "ingredients" },
  { id: "eggs", label: "Red spiders' eggs", group: "ingredients" },
  { id: "flask", label: "Crystal flask", group: "ingredients" },
  { id: "roar", label: "Bottled dinosaur roar", group: "ingredients" },
  { id: "arbuck", label: "Clean arbuck", group: "ingredients" },
  { id: "inert", label: "Inert adrenaline crystal", group: "ingredients" },
  { id: "chitin", label: "Spark chitin", group: "ingredients" },
  { id: "pulp", label: "Primal fruit pulp", group: "extract" },
  { id: "vial", label: "Empty vial", group: "extract" },
];

const chargeFields: Field[] = [
  { id: "charge", label: "Divine charge", group: "made" },
  { id: "parts", label: "Simple parts", group: "parts" },
  { id: "pale", label: "Pale energy", group: "energy" },
  { id: "flickering", label: "Flickering energy", group: "energy" },
  { id: "bright", label: "Bright energy", group: "energy" },
  { id: "glowing", label: "Glowing energy", group: "energy" },
  { id: "sparkling", label: "Sparkling energy", group: "energy" },
  { id: "gleaming", label: "Gleaming energy", group: "energy" },
  { id: "vibrant", label: "Vibrant energy", group: "energy" },
  { id: "lustrous", label: "Lustrous energy", group: "energy" },
  { id: "en-elder", label: "Elder energy", group: "energy" },
  { id: "brilliant", label: "Brilliant energy", group: "energy" },
  { id: "radiant", label: "Radiant energy", group: "energy" },
  { id: "luminous", label: "Luminous energy", group: "energy" },
  { id: "incandescent", label: "Incandescent energy", group: "energy" },
  { id: "ancestral", label: "Ancestral energy", group: "energy" },
];

function adrenVisible(id: string, level: number): boolean {
  const lv = Math.floor(level);
  const renewal = lv >= 115;
  const enhanced = lv >= 90 && !renewal;
  const superOnly = lv >= 87 && lv < 90;
  const base = new Set(["adren", "energy", "avantoe-unf", "papaya", "avantoe", "fungus", "water"]);
  if (base.has(id)) return true;
  if ((superOnly || enhanced || renewal) && (id === "adren4" || id === "crystal")) return true;
  if ((superOnly || renewal) && (id === "super-adren" || id === "super-adren4")) return true;
  if (enhanced && ["enhanced", "replen", "restore", "restore4", "snap-unf", "snapdragon", "eggs", "flask"].includes(id)) return true;
  if (renewal && ["renewal", "enhanced", "roar", "arbuck"].includes(id)) return true;
  if (lv >= 93 && ["inert", "chitin", "extract", "pulp", "vial"].includes(id)) return true;
  return false;
}

export function Elder() {
  return (
    <Fields
      storageKey="elder-calc-v1"
      title="Elder overloads"
      unit="Elder overload (6)"
      goalLabel="Elder overloads (6) you want"
      guide="Supers, then extremes, then an overload, a supreme, and an elder. Enter what you already have, including 3-dose and 4-dose overloads and supers. The total is how many elder overload (6) that stock finishes. Set a goal to see what is still missing, and the Herblore XP from potions you still have to mix."
      note="A supreme takes 4 doses of overload and 4 doses of each super. A (4) you already have counts as 4 doses and a (3) as 3. Doses still short are mixed as 3-dose potions, and part of a potion is rounded up, so 1 1/3 becomes 2. Leftover super doses also cover the supers inside extremes. Each overload (3) is one extreme (3) of every style plus a torstol, and each extreme is one super (3). Supers use a vial of water. Primal extract uses an empty vial and primal fruit pulp. XP includes the unfinished potion. No portable well, scroll of cleansing, or Herblore master cape. Recipes follow the RuneScape Wiki."
      groups={fieldGroups}
      fields={fields}
      planFor={(goal, stock) => plan(goal, stock)}
      maxFor={(stock) => maxElders(stock)}
    />
  );
}

export function Vuln() {
  const [level, setLevel] = useHerbLevel();
  const levelN = level === "" ? 0 : Number(level);
  const open = vulnRecipe(levelN) !== null;
  const recipe = vulnRecipe(levelN);
  return (
    <Fields
      storageKey="vuln-calc-v1"
      title="Vulnerability bombs"
      unit="Vulnerability bomb"
      goalLabel="Vulnerability bombs you want"
      guide="Enter what you already have. Your Herblore level picks the recipe. At 107 the bomb uses fewer runes and one roar instead of two."
      note="At 103 and at 105 a bomb takes 5 soul runes, 5 chaos runes, and 2 bottled dinosaur roars. At 107 that drops to 3, 3, and 1. Improved +1 is only faster. Each bomb is 1,100 Herblore XP. Primal extract, if you still mix it, is an empty vial and primal fruit pulp for 145 XP. A bomb vial is blown from molten glass or bought, so it is not in the Herblore XP. Boosts do not unlock a recipe. Recipes follow the RuneScape Wiki."
      groups={[made, ingredients, extract]}
      fields={vulnFields}
      level={level}
      onLevel={setLevel}
      recipe={recipe ? `${recipe.name}, level ${recipe.level}. ${recipe.detail}` : null}
      blocked={recipe ? null : "Vulnerability bombs start at 103 Herblore. Boosts do not count."}
      planFor={(goal, stock) => (open ? planVuln(goal, stock, levelN) : empty)}
      maxFor={(stock) => maxMade(Math.floor(stock.vuln ?? 0), open, (goal) => planVuln(goal, stock, levelN))}
    />
  );
}

export function Vitality() {
  const [level, setLevel] = useHerbLevel();
  const levelN = level === "" ? 0 : Number(level);
  const open = vitalityRecipe(levelN) !== null;
  const recipe = vitalityRecipe(levelN);
  return (
    <Fields
      storageKey="vitality-calc-v1"
      title="Powerburst of vitality"
      unit="Powerburst of vitality (4)"
      goalLabel="Powerbursts of vitality you want"
      guide="Enter what you already have. Your Herblore level picks the recipe. At 109 it takes one poison slime and a 3-dose Saradomin brew."
      note="At 105 and at 107 a powerburst takes 2 poison slime and one Saradomin brew (4). At 109 that drops to 1 slime and a Saradomin brew (3). A brew (4) is 4 doses and a brew (3) is 3. Brews are mixed as (3), and part of a brew is rounded up. A brew (3) is a toadflax potion (unf) and a crushed nest. The unfinished potion is a vial of water and clean toadflax. Each powerburst is 1,150 XP, each brew 180, and the unfinished potion 1. Primal extract is an empty vial and primal fruit pulp for 145 XP. Boosts do not count. Recipes follow the RuneScape Wiki."
      groups={[
        made,
        ingredients,
        { id: "brew", title: "Saradomin brew", note: "A brew (3) is a toadflax potion (unf) and a crushed nest." },
        extract,
      ]}
      fields={vitaFields}
      level={level}
      onLevel={setLevel}
      recipe={recipe ? `${recipe.name}, level ${recipe.level}. ${recipe.detail}` : null}
      blocked={recipe ? null : "Powerburst of vitality starts at 105 Herblore. Boosts do not count."}
      planFor={(goal, stock) => (open ? planVitality(goal, stock, levelN) : empty)}
      maxFor={(stock) => maxMade(Math.floor(stock.vitality ?? 0), open, (goal) => planVitality(goal, stock, levelN))}
    />
  );
}

export function Poison() {
  const [level, setLevel] = useHerbLevel();
  const levelN = level === "" ? 0 : Number(level);
  const open = levelN >= 100;
  return (
    <Fields
      storageKey="poison-calc-v1"
      title="Weapon poison +++"
      unit="Weapon poison +++ (3)"
      goalLabel="Weapon poison +++ you want"
      guide="Enter what you already have. One +++ is a weapon poison ++, poison slime, and primal extract. ++ you already have can be 3-dose or 4-dose."
      note="Weapon poison +++ is 100 Herblore and there is one recipe. It takes a weapon poison ++ (3), 1 poison slime, and 1 primal extract for 700 XP. A ++ (3) is the unfinished potion plus poison ivy berries for 190 XP. The unfinished potion is coconut milk and a cave nightshade for 1 XP. A ++ (4) counts as 4 doses and a ++ (3) as 3. The recipe uses 3 doses, and part of a potion is rounded up. Primal extract, if you still mix it, is an empty vial and primal fruit pulp for 145 XP. Boosts do not count. Recipes follow the RuneScape Wiki."
      groups={[doses, ingredients, extract]}
      fields={poisonFields}
      level={level}
      onLevel={setLevel}
      recipe={open ? "Weapon poison +++, level 100. One recipe." : null}
      blocked={open ? null : "Weapon poison +++ starts at 100 Herblore. Boosts do not count."}
      planFor={(goal, stock) => (open ? planPoison(goal, stock, levelN) : empty)}
      maxFor={(stock) => maxMade(Math.floor(stock.wpp3 ?? 0), open, (goal) => planPoison(goal, stock, levelN))}
    />
  );
}

export function Charming() {
  const [level, setLevel] = useHerbLevel();
  const levelN = level === "" ? 0 : Number(level);
  const open = levelN >= 102;
  return (
    <Fields
      storageKey="charming-calc-v1"
      title="Charming potions"
      unit="Charming potion (3)"
      goalLabel="Charming potions (3) you want"
      guide="Enter the charms, spark chitin, and extract you already have. A (4) counts as 4 doses. The total is how many charming potions (3) that stock finishes."
      note="Charming potion is 102 Herblore and there is one recipe. One (3) takes 4 gold, 4 green, 4 crimson, and 4 blue charms, 1 spark chitin, and 1 primal extract, for 1,000 XP. It adds one charm to each charm drop for 6 minutes. A (4) you already have counts as 4 doses and a (3) as 3. Doses still short are mixed as (3), and part of a potion is rounded up. Primal extract, if you still mix it, is an empty vial and primal fruit pulp for 145 XP. Boosts do not count. Recipes follow the RuneScape Wiki."
      groups={[doses, ingredients, extract]}
      fields={charmingFields}
      level={level}
      onLevel={setLevel}
      recipe={open ? "Charming potion, level 102. 4 of each base charm, 1 spark chitin, and 1 primal extract." : null}
      blocked={open ? null : "Charming potions start at 102 Herblore. Boosts do not count."}
      planFor={(goal, stock) => (open ? planCharming(goal, stock, levelN) : empty)}
      maxFor={(stock) => maxMade(charmingHeld(stock), open, (goal) => planCharming(goal, stock, levelN))}
    />
  );
}

export function Adren() {
  const [level, setLevel] = useHerbLevel();
  const levelN = level === "" ? 0 : Number(level);
  const adren = adrenPick(levelN);
  return (
    <Fields
      storageKey="adren-calc-v1"
      title={adren ? adren.name : "Adrenaline"}
      unit={adren ? adren.unit : "Adrenaline potion"}
      goalLabel={adren ? adren.goal : "Adrenaline potions you want"}
      guide="Enter what you already have. Your Herblore level picks the strongest adrenaline potion you can mix, then the total is how many of that potion your stock finishes."
      note="Adrenaline potions start at 84 and restore 25%. At 87, super adrenaline restores 30%, which beats replenishment at the same level because replenishment only restores 25%. At 90, enhanced replenishment restores 30% and also works as a super restore, so it is the one to make until adrenaline renewal at 115, which restores 40%. Renewal at 117 is only faster. At 119 it takes one roar and a super adrenaline (3) instead of two roars and a super adrenaline (4). An enhanced replenishment (6) you already have can be made into a renewal instead. Replenishment and enhanced replenishment need the recipe from Lady Meilyr. Adrenaline crystals are made from 93. Below that, the crystal is a raw material. A (4) counts as 4 doses and a (3) as 3, and part of a potion is rounded up. A crystal flask is Crafting, so it is not in the Herblore XP. Boosts do not count. Another player can assist the 117 and 119 recipes. Recipes follow the RuneScape Wiki."
      groups={[doses, ingredients, extract]}
      fields={adrenFields}
      shown={(field) => adrenVisible(field.id, levelN)}
      level={level}
      onLevel={setLevel}
      recipe={adren ? `${adren.name}, level ${adren.level}. ${adren.detail}` : null}
      blocked={adren ? null : "Adrenaline potions start at 84 Herblore. Boosts do not count."}
      planFor={(goal, stock) => (adren ? planAdrenaline(goal, stock, levelN) : empty)}
      maxFor={(stock) => maxMade(Math.floor(stock[adren?.output ?? "adren"] ?? 0), adren !== null, (goal) => planAdrenaline(goal, stock, levelN))}
    />
  );
}

export function Charges() {
  return (
    <Fields
      storageKey="charges-calc-v1"
      title="Divine charges"
      unit="Divine charge"
      goalLabel="Divine charges you want"
      guide="Enter the simple parts and divine energy you have. The total is how many full charges that stock finishes. Set a goal to see what is still missing."
      xpHeading="Invention XP"
      mixHeading="You will make"
      note="One divine charge is 20 simple parts and one pile of divine energy. Energies are not mixed inside a charge. A leftover pile finishes the next charge of that same energy. If nothing you own can finish another charge, the rest is priced in the energy you have the most progress toward, or incandescent energy. You do not need that energy's Divination level. Each charge is 220 Invention XP and 80 Divination XP. The discovery is Divine charge. Simple parts stay as parts. The empty Divine-o-matic charge is not included. Recipes follow the RuneScape Wiki."
      groups={[
        made,
        { id: "parts", title: "Simple parts" },
        {
          id: "energy",
          title: "Divine energy",
          note: "One energy type per charge. A leftover pile counts toward the next charge of that same type.",
        },
      ]}
      fields={chargeFields}
      planFor={(goal, stock) => planCharges(goal, stock)}
      maxFor={(stock) => maxMade(Math.floor(stock.charge ?? 0), true, (goal) => planCharges(goal, stock))}
    />
  );
}
