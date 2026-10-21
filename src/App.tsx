import { useEffect, useState } from "react";
import { items, viewIdsList, views } from "./data";
import { loadDone, openIds, saveDone, tally, type Group, type Role, type Slot } from "./progress";

const validIds = new Set(Object.keys(items));

const sections: Record<string, string> = {
  ed2: "Melee",
  "magic-path": "Magic",
  "necro-path": "Necromancy",
  "ranged-path": "Ranged",
  raksha: "Shared",
};

function readView() {
  const id = location.hash.replace(/^#/, "");
  return viewIdsList.includes(id) ? id : "start";
}

function useViewId() {
  const [id, setId] = useState(readView);
  useEffect(() => {
    const onHash = () => {
      setId(readView());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return id;
}

export function App() {
  const viewId = useViewId();
  const view = views.find((entry) => entry.id === viewId) ?? views[0];
  const [done, setDone] = useState(() => loadDone(validIds));

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveDone(next);
      return next;
    });
  }

  function reset() {
    if (!window.confirm("Clear all marks in this browser?")) return;
    const next = new Set<string>();
    saveDone(next);
    setDone(next);
  }

  const onStart = viewId === "start";
  const shown = onStart ? views[0] : view;
  const current = new Set(openIds(shown.groups, done));
  const counts = tally(shown.groups, done);

  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="top">
        <a className="brand" href="#start">
          Iron Order
        </a>
        <p className="count">
          {onStart ? "Trail " : ""}
          {counts.pathDone}/{counts.path}
        </p>
      </header>
      <div className="shell">
        <nav className="nav" aria-label="Branches">
          <a href="#start" aria-current={onStart ? "page" : undefined}>
            Start
          </a>
          {views.map((entry) => {
            const branch = tally(entry.groups, done);
            return (
              <span key={entry.id} className="nav-slot">
                {sections[entry.id] && <span className="nav-label">{sections[entry.id]}</span>}
                <a href={`#${entry.id}`} aria-current={entry.id === viewId ? "page" : undefined}>
                  {entry.label}
                  <span className="nav-count">
                    {branch.pathDone}/{branch.path}
                  </span>
                </a>
              </span>
            );
          })}
          <button type="button" className="clear" onClick={reset}>
            Clear
          </button>
        </nav>
        {onStart ? (
          <Intro />
        ) : (
          <main id="content">
            <h1>{view.label}</h1>
            <p className="guide">{view.guide}</p>
            <NextUp ids={[...current]} />
            <div className="tree">
              {view.groups.map((group) => (
                <Tier key={group.id} group={group} done={done} current={current} onToggle={toggle} />
              ))}
            </div>
          </main>
        )}
      </div>
    </>
  );
}

function Intro() {
  return (
    <main id="content" className="intro">
      <h1>Iron Order</h1>
      <p className="lede">
        Combat unlocks for an ironman. You cannot buy these from the Grand Exchange, so each list says where you farm it. The Trail is the melee order. Each style has a bossing path, and each boss on it has a page.
      </p>
      <h2>How to read a node</h2>
      <Marks />
      <h2>Branches</h2>
      <ul className="paths">
        <li>
          <a href="#trilha">
            <strong>Trail</strong>
            <span>The farm order. Start here.</span>
          </a>
        </li>
        <li>
          <a href="#free">
            <strong>Free</strong>
            <span>Coin-free upgrades, in the PVME order.</span>
          </a>
        </li>
        <li>
          <a href="#melee">
            <strong>Melee</strong>
            <span>The PVME melee list, with ironman sources.</span>
          </a>
        </li>
        <li>
          <a href="#magic">
            <strong>Magic</strong>
            <span>The PVME magic list, with ironman sources.</span>
          </a>
        </li>
        <li>
          <a href="#necro">
            <strong>Necromancy</strong>
            <span>The PVME necromancy list, with ironman sources.</span>
          </a>
        </li>
        <li>
          <a href="#ranged">
            <strong>Ranged</strong>
            <span>The PVME ranged list, with ironman sources.</span>
          </a>
        </li>
        <li>
          <a href="#magic-path">
            <strong>Magic path</strong>
            <span>Helwyr through Hereditas, in learn order.</span>
          </a>
        </li>
        <li>
          <a href="#necro-path">
            <strong>Necromancy path</strong>
            <span>Osseous through Rasial, then the later bosses.</span>
          </a>
        </li>
        <li>
          <a href="#ranged-path">
            <strong>Ranged path</strong>
            <span>Decimation, then Araxxor through Vorkath.</span>
          </a>
        </li>
        <li>
          <a href="#ed2">
            <strong>ED2</strong>
            <span>Clear the dungeon, then the three greater abilities.</span>
          </a>
        </li>
        <li>
          <a href="#glacor">
            <strong>Arch-Glacor</strong>
            <span>Mechanics, then nilas, then the Leng weapons.</span>
          </a>
        </li>
        <li>
          <a href="#zamorak">
            <strong>Zamorak</strong>
            <span>One kill, then the Havoc set and Chaos Roar.</span>
          </a>
        </li>
        <li>
          <a href="#zuk">
            <strong>Zuk</strong>
            <span>Hard mode with necromancy for the Ek-ZekKil, before the Havoc set.</span>
          </a>
        </li>
      </ul>
      <a className="go" href="#trilha">
        Open the trail
      </a>
      <p className="credit">Pictures from the RuneScape Wiki.</p>
    </main>
  );
}

function Marks() {
  return (
    <ul className="marks">
      <li>
        <span className="swatch is-next" aria-hidden="true" />
        Next. The first open step on the path.
      </li>
      <li>
        <span className="swatch is-done" aria-hidden="true" />
        Done. Click a node when you have it. The mark is saved in this browser.
      </li>
      <li>
        <span className="swatch is-side" aria-hidden="true" />
        Anytime. A side unlock. It does not block Next.
      </li>
    </ul>
  );
}

function NextUp({ ids }: { ids: string[] }) {
  if (ids.length === 0) return <p className="next-up">Path complete.</p>;
  if (ids.length === 1) {
    const item = items[ids[0]];
    return (
      <p className="next-up">
        <a href={`#item-${ids[0]}`}>Next: {item.title}</a>
        <span>{item.source}</span>
      </p>
    );
  }
  return (
    <p className="next-up">
      Next:{" "}
      {ids.map((id, index) => (
        <span key={id}>
          {index > 0 && " or "}
          <a href={`#item-${id}`}>{items[id].title}</a>
        </span>
      ))}
    </p>
  );
}

function Tier({
  group,
  done,
  current,
  onToggle,
}: {
  group: Group;
  done: Set<string>;
  current: Set<string>;
  onToggle: (id: string) => void;
}) {
  const gates = group.slots.filter((slot) => slot.role === "gate");
  const drops = group.slots.filter((slot) => slot.role === "loot");
  const extras = group.slots.filter((slot) => slot.role === "side");

  return (
    <section className="tier" aria-labelledby={group.id}>
      {group.bridge && <p className="bridge">{group.bridge}</p>}
      <h2 id={group.id}>{group.title}</h2>
      <NodeRow slots={gates} done={done} current={current} onToggle={onToggle} />
      <NodeRow slots={drops} label={gates.length > 0 ? "Drops" : undefined} done={done} current={current} onToggle={onToggle} />
      <NodeRow slots={extras} label={gates.length + drops.length > 0 ? "Anytime" : undefined} done={done} current={current} onToggle={onToggle} />
    </section>
  );
}

function NodeRow({
  slots,
  label,
  done,
  current,
  onToggle,
}: {
  slots: Slot[];
  label?: string;
  done: Set<string>;
  current: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (slots.length === 0) return null;
  const role = slots[0].role;
  return (
    <div className={`branch branch-${role}`}>
      {label && <p className="branch-label">{label}</p>}
      <ul className="nodes">
        {slots.map((slot) => (
          <li key={slot.id}>
            <Node
              id={slot.id}
              role={slot.role}
              checked={done.has(slot.id)}
              isNext={current.has(slot.id)}
              onToggle={onToggle}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Node({
  id,
  role,
  checked,
  isNext,
  onToggle,
}: {
  id: string;
  role: Role;
  checked: boolean;
  isNext: boolean;
  onToggle: (id: string) => void;
}) {
  const item = items[id];
  const state = `${checked ? " is-done" : ""}${isNext ? " is-next" : ""}${role === "side" ? " is-side" : ""}`;
  return (
    <label className={`node${state}`} id={`item-${id}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(id)}
        aria-label={item.title}
      />
      <span className="frame">
        {item.image ? <img src={item.image} alt="" /> : <span className="slot" aria-hidden="true" />}
        {checked && <span className="tick" aria-hidden="true" />}
      </span>
      <span className="name">{item.title}</span>
      <span className="source">{item.source}</span>
    </label>
  );
}
