export type Role = "gate" | "loot" | "side";

export type Slot = { id: string; role: Role };

export type Group = {
  id: string;
  title: string;
  /** One line between this tier and the one above it. */
  bridge?: string;
  /**
   * While this other group still has a path step open, this group does not block.
   * Both can be the next step.
   */
  alongside?: string;
  slots: Slot[];
};

export type View = {
  id: string;
  label: string;
  guide: string;
  groups: Group[];
};

export const STORAGE_KEY = "ordem-ferro-v1";

export function gate(...ids: string[]): Slot[] {
  return ids.map((id) => ({ id, role: "gate" }));
}

export function loot(...ids: string[]): Slot[] {
  return ids.map((id) => ({ id, role: "loot" }));
}

export function side(...ids: string[]): Slot[] {
  return ids.map((id) => ({ id, role: "side" }));
}

export function slots(...parts: Slot[][]): Slot[] {
  return parts.flat();
}

export function flatten(groups: Group[]): Slot[] {
  return groups.flatMap((group) => group.slots);
}

export function tally(groups: Group[], done: Set<string>) {
  const seen = new Set<string>();
  let path = 0;
  let pathDone = 0;
  let extra = 0;
  let extraDone = 0;
  for (const slot of flatten(groups)) {
    if (seen.has(slot.id)) continue;
    seen.add(slot.id);
    const on = done.has(slot.id);
    if (slot.role === "side") {
      extra += 1;
      if (on) extraDone += 1;
    } else {
      path += 1;
      if (on) pathDone += 1;
    }
  }
  return { path, pathDone, extra, extraDone };
}

function pending(group: Group, done: Set<string>): string | null {
  for (const role of ["gate", "loot"] as const) {
    for (const slot of group.slots) {
      if (slot.role !== role) continue;
      if (!done.has(slot.id)) return slot.id;
    }
  }
  return null;
}

/** First open gate in a group, then that group's loot, then the next group. Side never blocks. */
export function nextId(groups: Group[], done: Set<string>): string | null {
  for (const group of groups) {
    const id = pending(group, done);
    if (!id) continue;
    if (group.alongside) {
      const partner = groups.find((entry) => entry.id === group.alongside);
      if (partner && pending(partner, done)) continue;
    }
    return id;
  }
  return null;
}

/** The path's next step, plus a tier that may be done before it. */
export function openIds(groups: Group[], done: Set<string>): string[] {
  const main = nextId(groups, done);
  if (!main) return [];
  const mainGroup = groups.find((group) => group.slots.some((slot) => slot.id === main));
  const ids = [main];
  for (const group of groups) {
    if (!mainGroup || group.alongside !== mainGroup.id) continue;
    const id = pending(group, done);
    if (id) ids.push(id);
  }
  return ids;
}

export function loadDone(valid: Set<string>): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(
      parsed.filter((id): id is string => typeof id === "string" && valid.has(id)),
    );
  } catch {
    return new Set();
  }
}

export function saveDone(done: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...done]));
}

function selfCheck() {
  const groups: Group[] = [
    {
      id: "1",
      title: "",
      slots: [
        { id: "a", role: "gate" },
        { id: "b", role: "side" },
        { id: "c", role: "loot" },
      ],
    },
    { id: "2", title: "", slots: [{ id: "d", role: "gate" }] },
  ];
  if (nextId(groups, new Set()) !== "a") throw new Error("expected a");
  if (nextId(groups, new Set(["a"])) !== "c") throw new Error("expected c");
  if (nextId(groups, new Set(["a", "c"])) !== "d") throw new Error("expected d");
  if (nextId(groups, new Set(["a", "b", "c", "d"])) !== null) throw new Error("expected done");
  const choice: Group[] = [
    { id: "ed2", title: "", alongside: "ezk", slots: [{ id: "halberd", role: "gate" }] },
    { id: "ezk", title: "", slots: [{ id: "kiln", role: "gate" }] },
    { id: "later", title: "", slots: [{ id: "cape", role: "gate" }] },
  ];
  if (nextId(choice, new Set()) !== "kiln") throw new Error("ed2 should not block ezk");
  if (openIds(choice, new Set()).join() !== "kiln,halberd") throw new Error("both open");
  if (nextId(choice, new Set(["kiln"])) !== "halberd") throw new Error("ed2 follows the sword");
  if (nextId(choice, new Set(["halberd"])) !== "kiln") throw new Error("sword stays open");
  if (nextId(choice, new Set(["halberd", "kiln"])) !== "cape") throw new Error("later tier");
  const counts = tally(groups, new Set(["a", "b"]));
  if (counts.path !== 3 || counts.pathDone !== 1 || counts.extra !== 1 || counts.extraDone !== 1) {
    throw new Error("tally");
  }
}

selfCheck();
