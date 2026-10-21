import { access, mkdir, writeFile } from "node:fs/promises";

/**
 * Each unlock tries these wiki sources in order.
 * "page:Title" uses the article's main picture.
 * "file:Name.png" uses that file.
 */
const sources = {
  "free-style-90": ["page:Attack"],
  "free-rov": ["page:Ring of vigour"],
  "free-def-cape": ["file:Defence cape detail.png"],
  "free-prayer": ["file:Soul Split.png"],
  "free-herb": ["page:Elder overload potion"],
  "free-tww": ["file:Sunshine.png"],
  "free-str-cape": ["file:Strength cape detail.png"],
  "free-atk-cape": ["page:Attack master cape"],
  "free-range-cape": ["file:Ranged cape detail.png"],
  "free-dba": ["page:Dragon battleaxe"],
  "free-dscim": ["page:Dragon scimitar"],
  "free-berserk-fury": ["page:Berserker's Fury"],
  "free-arch-112": ["page:Archaeology"],
  "free-codex-ult": ["page:Codex Ultimatus"],
  "free-totem": ["page:Totem of Vitality"],
  "free-combat-120": ["page:Max cape"],
  "free-sum-hellhound": ["page:Hellhound (familiar)", "page:Binding contract (hellhound)"],
  "free-sum-reaver": ["page:Blood reaver (familiar)", "page:Blood reaver"],
  "free-sum-nihil": ["page:Blood nihil pouch"],
  "free-sum-kalg": ["page:Kal'gerion demon (familiar)", "page:Binding contract (kal'gerion demon)"],
  "free-sum-ripper": ["page:Ripper demon (familiar)", "page:Binding contract (ripper demon)"],
  "free-asr": ["page:Asylum surgeon's ring"],
  "free-zorgoth": ["page:Zorgoth's soul ring"],
  "melee-p6e4": ["file:Precise.png"],
  "melee-eq1": ["file:Equilibrium.png"],
  "melee-laniakea": ["page:Laniakea's spear"],
  "melee-amhej": ["page:Am-hej"],
  "melee-scourge": ["page:Abyssal scourge"],
  "melee-jas": ["page:Scripture of Jas"],
  "melee-jaws": ["page:Jaws of the Abyss"],
  "melee-laceration": ["page:Laceration boots"],
  "melee-crack4": ["file:Crackling.png"],
  "melee-flank4": ["file:Flanking.png"],
  "melee-imp4": ["file:Impatient.png"],
  "melee-mw2h": ["page:Masterwork 2h sword"],
  "melee-as4": ["file:Aftershock.png"],
  "melee-eof-annih": ["page:Essence of Finality amulet"],
  "melee-biting4": ["file:Biting.png"],
  "melee-gop": ["page:Gloves of passage"],
  "melee-eof-spec": ["page:Dragon claw"],
  "melee-champ": ["page:Champion's ring"],
  "melee-divert": ["file:Divert.png"],
  "melee-genesis-ezk": ["page:Shard of Genesis Essence"],
  "melee-eclipsed": ["file:Eclipsed Soul.png"],
  "melee-malevolence": ["file:Malevolence.png"],
  "melee-nodon": ["page:Nodon spike harness"],
  "melee-heroism": ["page:Enchantment of heroism"],
  "melee-perk-dw": ["page:Ancient weapon gizmo"],
  "melee-perk-2h": ["file:Ruthless.png"],
  "melee-cinder": ["page:Cinderbane gloves"],
  "melee-zgs": ["page:Zaros godsword"],
  "melee-mwsoa": ["page:Masterwork Spear of Annihilation"],
  "melee-genesis-leng": ["page:Shard of Genesis Essence"],
  "melee-limitless": ["page:Limitless"],
  "ed2-halberd": ["page:Dragon Rider lance"],
  "ed2-antifire": ["page:Super antifire"],
  "ed2-astellarn": ["page:Astellarn"],
  "ed2-verak": ["page:Verak Lith"],
  "ed2-bsd": ["page:Black stone dragon"],
  "ed2-flurry": ["file:Greater Flurry.png"],
  "ed2-fury": ["file:Greater Fury.png"],
  "ed2-barge": ["file:Greater Barge.png"],
  "ag-mech-creeping": ["file:Creeping Ice.png", "page:Arch-Glacor"],
  "ag-mech-flurry": ["file:Flurry (Arch-Glacor).png", "page:Arch-Glacor"],
  "ag-mech-glacytes": ["page:Glacyte"],
  "ag-mech-pillars": ["file:Pillars of Ice.png", "page:Arch-Glacor"],
  "ag-mech-cannon": ["file:Frost Cannon.png", "page:Arch-Glacor"],
  "ag-mech-core": ["file:Exposed Core.png", "page:Arch-Glacor"],
  "ag-nm5": ["page:Arch-Glacor"],
  "ag-nilas": ["page:Dark nilas"],
  "ag-t85": ["page:Dark ice shard"],
  "ag-artefact": ["page:Leng artefact"],
  "ag-wen": ["page:Scripture of Wen"],
  "ag-hm-streak": ["page:Arch-Glacor"],
  "ag-core-1": ["page:Frozen core of Leng"],
  "ag-core-2": ["page:Frozen core of Leng"],
  "ag-leng-mh": ["page:Dark Shard of Leng"],
  "ag-leng-oh": ["page:Dark Sliver of Leng"],
  "zam-first": ["page:Zamorak, Lord of Chaos"],
  "zam-hood": ["page:Vestments of havoc hood"],
  "zam-boots": ["page:Vestments of havoc boots"],
  "zam-bottom": ["page:Vestments of havoc robe bottom"],
  "zam-top": ["page:Vestments of havoc robe top"],
  "zam-roar": ["file:Chaos Roar.png"],
  "zuk-kiln": ["page:Fight Kiln"],
  "zuk-nm": ["page:TzKal-Zuk"],
  "zuk-kal-ket": ["page:Igneous Kal-Ket"],
  "zuk-four": ["page:Igneous Kal-Xil"],
  "zuk-ful": ["page:Scripture of Ful"],
  "zuk-hm": ["page:TzKal-Zuk"],
  "zuk-ezk": ["page:Ek-ZekKil"],
  "zuk-hm-cape": ["file:Igneous Kal-Ket (hard mode).png", "page:Igneous Kal-Ket"],
  "magic-gstaff": ["file:Guthix staff detail.png", "page:Guthix staff"],
  "magic-obliteration": ["file:Obliteration detail.png", "page:Obliteration"],
  "magic-gconc": ["file:Greater Concentrated Blast.png", "page:Greater Concentrated Blast"],
  "magic-pf": ["file:Planted Feet.png", "page:Planted Feet"],
  "magic-wraps": ["file:Kerapac's wrist wraps detail.png", "page:Kerapac's wrist wraps"],
  "magic-boots": ["file:Blast diffusion boots detail.png", "page:Blast diffusion boots"],
  "magic-tectonic": ["file:Tectonic robe top detail.png", "page:Tectonic armour"],
  "magic-roar": ["file:Roar of Awakening detail.png", "page:Roar of Awakening"],
  "magic-ode": ["file:Ode to Deceit detail.png", "page:Ode to Deceit"],
  "magic-aos": ["file:Amulet of souls detail.png", "page:Amulet of souls"],
  "magic-pouches": ["file:Grasping rune pouch (black) detail.png", "page:Grasping rune pouch"],
  "magic-eof-iban": ["file:Iban's staff detail.png", "page:Iban's staff"],
  "magic-reaver": ["file:Reaver's ring detail.png", "page:Reaver's ring"],
  "magic-fsoa": ["file:Fractured Staff of Armadyl detail.png", "page:Fractured Staff of Armadyl"],
  "magic-grim": ["file:Erethdor's grimoire detail.png", "page:Erethdor's grimoire"],
  "magic-perk-dw": ["file:Caroming.png", "page:Caroming"],
  "magic-perk-2h": ["file:Precise.png", "page:Precise"],
  "magic-tumeken": ["page:Robe top of Tumeken's resplendence"],
  "magic-channel": ["file:Channeller's ring detail.png", "page:Channeller's ring"],
  "magic-genesis": ["page:Shard of Genesis Essence"],
  "magic-affliction": ["file:Affliction.png", "page:Affliction"],
  "magic-gsun": ["file:Greater Sunshine.png", "page:Greater Sunshine"],
  "magic-gchain": ["file:Greater Chain.png", "page:Greater Chain"],
  "magic-meta": ["file:Enchantment of metaphysics detail.png", "page:Enchantment of metaphysics"],
  "magic-tempest": ["file:Magma Tempest.png", "page:Magma Tempest"],
  "magic-corrupt": ["file:Corruption Blast.png", "page:Corruption Blast"],
  "magic-eof-gstaff": ["file:Guthix staff detail.png", "page:Guthix staff"],
  "magic-legatus": ["file:Legatus's Emberstaff detail.png", "page:Legatus's Emberstaff"],
  "magic-crypt": ["page:Cryptbloom top"],
  "necro-t70": ["file:Death guard (tier 70) detail.png", "page:Death guard"],
  "necro-armour": ["file:Deathwarden robe top (tier 70) detail.png"],
  "necro-nexus": ["file:Deathwarden nexus detail.png", "page:Deathwarden nexus"],
  "necro-amulet": ["file:Conjurer's raising amulet detail.png", "page:Conjurer's raising amulet"],
  "necro-t80": ["file:Death guard (tier 80) detail.png", "page:Death guard"],
  "necro-t90": ["file:Death guard (tier 90) detail.png", "page:Death guard"],
  "necro-perk": ["file:Precise.png", "page:Precise"],
  "necro-set": ["page:Robe top of the First Necromancer"],
  "necro-ring": ["file:Occultist's ring detail.png", "page:Occultist's ring"],
  "necro-omni": ["file:Omni guard detail.png", "page:Omni guard"],
  "necro-lantern": ["file:Soulbound lantern detail.png", "page:Soulbound lantern"],
  "necro-eof": ["file:Death guard (tier 70) detail.png", "page:Death guard"],
  "necro-flank": ["file:Skull lantern (tier 90) detail.png", "page:Skull lantern"],
  "necro-eq4": ["file:Equilibrium.png", "page:Equilibrium"],
  "necro-genesis": ["page:Shard of Genesis Essence"],
  "necro-ruination": ["file:Ruination.png", "page:Ruination"],
  "necro-devourer": ["page:The Devourer's Nexus"],
  "necro-flank-100": ["file:Soulbound lantern detail.png", "page:Soulbound lantern"],
  "necro-mask": ["file:Misalionar's death mask detail.png", "page:Misalionar's death mask"],
  "necro-dtb": ["file:Deathtouch bracelet detail.png", "page:Deathtouch bracelet"],
  "range-deci": ["file:Decimation detail.png", "page:Decimation"],
  "range-sirenic": ["file:Sirenic hauberk detail.png", "page:Sirenic armour"],
  "range-nightmare": ["file:Nightmare gauntlets detail.png", "page:Nightmare gauntlets"],
  "range-fleeting": ["file:Fleeting boots detail.png", "page:Fleeting boots"],
  "range-quiver": ["file:Pernix's quiver detail.png", "page:Pernix's quiver"],
  "range-grico": ["file:Greater Ricochet.png", "page:Greater Ricochet"],
  "range-gloom": ["file:Gloomfire bow detail.png", "page:Gloomfire bow"],
  "range-bolg": ["file:Bow of the Last Guardian detail.png", "page:Bow of the Last Guardian"],
  "range-eof-gloom": ["file:Gloomfire bow detail.png", "page:Gloomfire bow"],
  "range-eof-ecb": ["file:Eldritch crossbow detail.png", "page:Eldritch crossbow"],
  "range-eof-sgb": ["file:Seren godbow detail.png", "page:Seren godbow"],
  "range-perk": ["file:Caroming.png", "page:Caroming"],
  "range-eof-deci": ["file:Decimation detail.png", "page:Decimation"],
  "range-draco": ["file:Dracolich hauberk detail.png", "page:Dracolich armour"],
  "range-stalker": ["file:Stalker's ring detail.png", "page:Stalker's ring"],
  "range-shadows": ["file:Enchantment of shadows detail.png", "page:Enchantment of shadows"],
  "range-edraco": ["page:Elite Dracolich hauberk"],
  "range-gds": ["file:Greater Death's Swiftness.png", "page:Greater Death's Swiftness"],
  "range-dread": ["file:Enchantment of dread detail.png", "page:Enchantment of dread"],
  "range-genesis": ["page:Shard of Genesis Essence"],
  "range-desolation": ["file:Desolation.png", "page:Desolation"],
  "range-corrupt": ["file:Corruption Shot.png", "page:Corruption Shot"],
  "helwyr-kill": ["page:Helwyr"],
  "kera-nm": ["page:Kerapac"],
  "kera-hm": ["page:Kerapac"],
  "rathis-kill": ["page:Rathis"],
  "pthentraken-kill": ["page:Pthentraken"],
  "sanctum-vermyx": ["page:Vermyx, Brood Mother"],
  "sanctum-kezalam": ["page:Kezalam, the Wanderer"],
  "sanctum-nakatra": ["page:Nakatra, Devourer Eternal"],
  "vorago-kill": ["page:Vorago"],
  "raksha-kill": ["page:Raksha, the Shadow Colossus"],
  "osseous-kill": ["page:Osseous"],
  "osseous-streak": ["page:Osseous"],
  "osseous-nofood": ["page:Osseous"],
  "rasial-kill": ["page:Rasial, the First Necromancer"],
  "araxx-kill": ["page:Araxxor"],
  "araxx-paths": ["page:Araxxor"],
  "araxx-100": ["page:Araxxor"],
  "telos-kill": ["page:Telos, the Warden"],
  "telos-100": ["page:Telos, the Warden"],
  "vorkath-nm": ["page:Vorkath"],
  "vorkath-hm": ["page:Vorkath"],
  "ed3-leviathan": ["page:Crassian Leviathan"],
  "ed3-taraket": ["page:Taraket the Necromancer"],
  "ed3-ambassador": ["page:The Ambassador"],
  "amascut-nm": ["page:Amascut"],
  "solak-kill": ["page:Solak, Guardian of the Grove"],
  "hereditas-kill": ["page:Vault of Hereditas"],
  "croesus-kill": ["page:Croesus"],
  "mazcab-kill": ["page:Yakamaru"],
};

const headers = {
  "User-Agent": "IronOrder/0.1 (personal RS3 ironman unlock tree; icon fetch)",
  "Api-User-Agent": "IronOrder/0.1 (personal RS3 ironman unlock tree; icon fetch)",
};

const cache = new Map();

async function wiki(params) {
  const url = new URL("https://runescape.wiki/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`wiki ${response.status}`);
  return response.json();
}

async function download(source) {
  if (cache.has(source)) return cache.get(source);
  const imageUrl = source.startsWith("file:") ? await fileUrl(source.slice(5)) : await pageUrl(source.slice(5));
  if (!imageUrl) {
    cache.set(source, null);
    return null;
  }
  const response = await fetch(imageUrl, { headers });
  const body = response.ok ? Buffer.from(await response.arrayBuffer()) : null;
  cache.set(source, body);
  return body;
}

async function pageUrl(title) {
  const data = await wiki({
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "160",
    titles: title,
  });
  const page = Object.values(data.query.pages)[0];
  return page?.thumbnail?.source ?? null;
}

async function fileUrl(name) {
  const data = await wiki({
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "160",
    titles: `File:${name}`,
  });
  const page = Object.values(data.query.pages)[0];
  if (page?.missing !== undefined) return null;
  const info = page?.imageinfo?.[0];
  return info?.thumburl ?? info?.url ?? null;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

await mkdir("public/icons", { recursive: true });
const missed = [];

for (const [id, options] of Object.entries(sources)) {
  const path = `public/icons/${id}.png`;
  if (await exists(path)) continue;
  let body = null;
  for (const source of options) {
    body = await download(source);
    if (body) break;
  }
  if (!body) {
    missed.push(id);
    continue;
  }
  await writeFile(path, body);
  console.log(id);
}

if (missed.length) {
  console.error("missing", missed.join(", "));
  process.exitCode = 1;
}
