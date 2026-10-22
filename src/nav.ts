export type NavItem = {
  id: string;
  blurb?: string;
  children?: string[];
};

export type NavGroup = {
  id: string;
  title: string;
  home: "cards" | "links";
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: "orders",
    title: "Orders",
    home: "cards",
    items: [
      { id: "trilha", blurb: "The melee farm, from the first tier to the last." },
      { id: "free", blurb: "Coin-free upgrades, in the PVME order." },
      { id: "melee", blurb: "The PVME melee list, with ironman sources." },
      { id: "magic", blurb: "The PVME magic list, with ironman sources." },
      { id: "necro", blurb: "The PVME necromancy list, with ironman sources." },
      { id: "ranged", blurb: "The PVME ranged list, with ironman sources." },
    ],
  },
  {
    id: "melee",
    title: "Melee",
    home: "cards",
    items: [
      {
        id: "melee-path",
        blurb: "Elite Dungeon 2 and the Ek-ZekKil, then Zuk, Arch-Glacor, and Zamorak.",
        children: ["ed2", "zuk", "glacor", "zamorak"],
      },
    ],
  },
  {
    id: "magic",
    title: "Magic",
    home: "cards",
    items: [
      {
        id: "magic-path",
        blurb: "Helwyr through the later bosses, in learn order.",
        children: ["helwyr", "kerapac", "sanctum", "vorago"],
      },
    ],
  },
  {
    id: "necro",
    title: "Necromancy",
    home: "cards",
    items: [
      {
        id: "necro-path",
        blurb: "Osseous through Rasial, then the bosses that follow.",
        children: ["osseous", "rasial"],
      },
    ],
  },
  {
    id: "ranged",
    title: "Ranged",
    home: "cards",
    items: [
      {
        id: "ranged-path",
        blurb: "Decimation, then Araxxor through Vorkath.",
        children: ["araxxor", "telos", "vorkath", "ed3"],
      },
    ],
  },
  {
    id: "shared",
    title: "Shared",
    home: "links",
    items: [
      { id: "raksha" },
      { id: "matriarchs" },
      { id: "amascut" },
      { id: "solak" },
      { id: "hereditas" },
      { id: "croesus" },
      { id: "mazcab" },
    ],
  },
];
