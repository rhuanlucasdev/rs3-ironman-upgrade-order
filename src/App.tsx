import { useEffect, useState } from "react";
import { Calculator } from "./Calculator";
import { items, viewIdsList, views } from "./data";
import { navGroups, type NavGroup as NavGroupData } from "./nav";
import { loadDone, saveDone, tally } from "./progress";
import { BranchPage, Intro } from "./tree";

const validIds = new Set(Object.keys(items));
const viewById = new Map(views.map((view) => [view.id, view]));

function readView() {
  const id = location.hash.replace(/^#/, "");
  if (id === "calc") return "calc";
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

function useScrollNav(viewId: string) {
  useEffect(() => {
    const link = document.querySelector<HTMLElement>('.nav a[aria-current="page"]');
    const nav = link?.closest<HTMLElement>(".nav");
    if (!link || !nav || nav.scrollHeight <= nav.clientHeight) return;
    const top = link.offsetTop;
    const bottom = top + link.offsetHeight;
    if (top >= nav.scrollTop && bottom <= nav.scrollTop + nav.clientHeight) return;
    nav.scrollTop = top - nav.clientHeight / 2 + link.offsetHeight / 2;
  }, [viewId]);
}

function useWide() {
  const query = "(min-width: 820px)";
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const onChange = () => setWide(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return wide;
}

export function App() {
  const viewId = useViewId();
  const wide = useWide();
  useScrollNav(viewId);
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
  const onCalc = viewId === "calc";
  const shown = onStart || onCalc ? views[0] : view;
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
        <div className="top-links">
          <a className="tab" href="#calc" aria-current={onCalc ? "page" : undefined}>
            Calculator
          </a>
          {!onCalc && !onStart && (
            <p className="count">
              {counts.pathDone}/{counts.path}
            </p>
          )}
        </div>
      </header>
      <div className="shell">
        <nav className={`nav${onStart || onCalc ? " nav-quiet" : ""}`} aria-label="Branches">
          {navGroups.map((group) => (
            <NavGroup key={group.id} group={group} viewId={viewId} wide={wide} done={done} />
          ))}
          <button type="button" className="clear" onClick={reset}>
            Clear
          </button>
        </nav>
        {onCalc ? <Calculator /> : onStart ? <Intro done={done} /> : <BranchPage view={view} done={done} onToggle={toggle} />}
      </div>
    </>
  );
}

function NavGroup({
  group,
  viewId,
  wide,
  done,
}: {
  group: NavGroupData;
  viewId: string;
  wide: boolean;
  done: Set<string>;
}) {
  const here = group.items.some((item) => item.id === viewId || item.children?.includes(viewId));
  const [open, setOpen] = useState(wide || here);
  useEffect(() => {
    setOpen(wide || here);
  }, [wide, here]);

  return (
    <details
      className="nav-group"
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open;
        if (next !== open) setOpen(next);
      }}
    >
      <summary>{group.title}</summary>
      <div className="nav-links">
        {group.items.map((item) => (
          <span key={item.id} className="nav-slot">
            <NavLink id={item.id} viewId={viewId} done={done} />
            {item.children?.map((id) => (
              <NavLink key={id} id={id} viewId={viewId} done={done} child />
            ))}
          </span>
        ))}
      </div>
    </details>
  );
}

function NavLink({ id, viewId, done, child }: { id: string; viewId: string; done: Set<string>; child?: boolean }) {
  const entry = viewById.get(id);
  if (!entry) return null;
  const branch = tally(entry.groups, done);
  return (
    <a className={child ? "is-child" : undefined} href={`#${id}`} aria-current={id === viewId ? "page" : undefined}>
      <span className="nav-name">{entry.label}</span>
      <span className="nav-count">
        {branch.pathDone}/{branch.path}
      </span>
    </a>
  );
}
