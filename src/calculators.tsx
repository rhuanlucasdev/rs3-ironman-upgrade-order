import type { ComponentType } from "react";
import { Adren, Charges, Charming, Elder, Poison, Vitality, Vuln } from "./herbs";
import { IncenseCalc, MagicArmour, MasterworkBow, MasterworkSword, RangedArmour, RunesCalc } from "./panels";

export const calculators: { id: string; label: string; Panel: ComponentType }[] = [
  { id: "elder", label: "Elder overloads", Panel: Elder },
  { id: "vuln", label: "Vulnerability bombs", Panel: Vuln },
  { id: "vitality", label: "Powerburst of vitality", Panel: Vitality },
  { id: "poison", label: "Weapon poison +++", Panel: Poison },
  { id: "charming", label: "Charming potions", Panel: Charming },
  { id: "adren", label: "Adrenaline", Panel: Adren },
  { id: "charges", label: "Divine charges", Panel: Charges },
  { id: "mw-ranged", label: "Masterwork ranged", Panel: RangedArmour },
  { id: "mw-magic", label: "Masterwork magic", Panel: MagicArmour },
  { id: "mw-bow", label: "Masterwork bow", Panel: MasterworkBow },
  { id: "mw-sword", label: "Masterwork sword", Panel: MasterworkSword },
  { id: "runes", label: "Runes", Panel: RunesCalc },
  { id: "incense", label: "Incense sticks", Panel: IncenseCalc },
];
