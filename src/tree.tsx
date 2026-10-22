import { items, views } from "./data";
import { navGroups } from "./nav";
import { openIds, tally, type Group, type Role, type Slot, type View } from "./progress";

const viewById = new Map(views.map((view) => [view.id, view]));

export function Intro({ done }: { done: Set<string> }) {
  const orders = navGroups.find((group) => group.id === "orders");
  const paths = navGroups.filter((group) => group.home === "cards" && group.id !== "orders");
  const shared = navGroups.find((group) => group.home === "links");
  return (
    <main id="content" className="home">
      <h1>Iron Order</h1>
      <p className="lede">
        Combat unlocks for an ironman. You cannot buy these from the Grand Exchange, so each list says where you farm it. Start with the Trail, or open a combat style and follow its bosses.
      </p>
      <div className="home-actions">
        <a className="go" href="#trilha">
          Open the trail
        </a>
        <a className="go go-quiet" href="#calc">
          Calculator
        </a>
      </div>
      <h2>How to read a node</h2>
      <Marks />
      {orders && (
        <>
          <h2>{orders.title}</h2>
          <ul className="home-grid">
            {orders.items.map((item) => (
              <HomeCard key={item.id} id={item.id} blurb={item.blurb} done={done} />
            ))}
          </ul>
        </>
      )}
      <h2>Paths</h2>
      <ul className="home-grid">
        {paths.map((group) => {
          const item = group.items[0];
          return <HomeCard key={item.id} id={item.id} blurb={item.blurb} children={item.children} done={done} />;
        })}
      </ul>
      {shared && (
        <>
          <h2>{shared.title}</h2>
          <ul className="home-links">
            {shared.items.map((item) => {
              const view = viewById.get(item.id);
              if (!view) return null;
              const count = tally(view.groups, done);
              return (
                <li key={item.id}>
                  <a href={`#${item.id}`}>
                    {view.label}
                    <span>
                      {count.pathDone}/{count.path}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <p className="credit">Pictures from the RuneScape Wiki.</p>
    </main>
  );
}

function HomeCard({
  id,
  blurb,
  children,
  done,
}: {
  id: string;
  blurb?: string;
  children?: string[];
  done: Set<string>;
}) {
  const view = viewById.get(id);
  if (!view) return null;
  const count = tally(view.groups, done);
  return (
    <li className="home-card">
      <a href={`#${id}`}>
        <span className="home-title">
          <strong>{view.label}</strong>
          <span>
            {count.pathDone}/{count.path}
          </span>
        </span>
        {blurb && <span className="home-blurb">{blurb}</span>}
      </a>
      {children && children.length > 0 && (
        <p className="home-bosses">
          {children.map((child) => {
            const boss = viewById.get(child);
            if (!boss) return null;
            return (
              <a key={child} href={`#${child}`}>
                {boss.label}
              </a>
            );
          })}
        </p>
      )}
    </li>
  );
}

export function BranchPage({
  view,
  done,
  onToggle,
}: {
  view: View;
  done: Set<string>;
  onToggle: (id: string) => void;
}) {
  const current = new Set(openIds(view.groups, done));
  return (
    <main id="content">
      <h1>{view.label}</h1>
      <p className="guide">{view.guide}</p>
      <NextUp ids={[...current]} />
      <div className="tree">
        {view.groups.map((group) => (
          <Tier key={group.id} group={group} done={done} current={current} onToggle={onToggle} />
        ))}
      </div>
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
            <Node id={slot.id} role={slot.role} checked={done.has(slot.id)} isNext={current.has(slot.id)} onToggle={onToggle} />
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
      <input type="checkbox" checked={checked} onChange={() => onToggle(id)} aria-label={item.title} />
      <span className="frame">
        {item.image ? <img src={item.image} alt="" /> : <span className="slot" aria-hidden="true" />}
        {checked && <span className="tick" aria-hidden="true" />}
      </span>
      <span className="name">{item.title}</span>
      <span className="source">{item.source}</span>
    </label>
  );
}
