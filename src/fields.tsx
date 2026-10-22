import { useEffect, useMemo, useState, type ReactNode } from "react";
import { formatExact, type Plan, type Stock } from "./calc";

export type Field = { id: string; label: string; group: string };
export type Group = { id: string; title: string; note?: string };

function digits(value: string): string {
  const cleaned = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 7);
  if (cleaned === "") return "";
  return Number(cleaned) > 1_000_000 ? "1000000" : cleaned;
}

function levelDigits(value: string): string {
  const cleaned = value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, 3);
  if (cleaned === "") return "";
  return String(Math.min(120, Number(cleaned)));
}

function loadStock(key: string, known: Set<string>): { stock: Record<string, string>; goal: string } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { stock: {}, goal: "" };
    const parsed = JSON.parse(raw) as { stock?: Record<string, string>; goal?: string };
    const stock: Record<string, string> = {};
    for (const [id, value] of Object.entries(parsed.stock ?? {})) {
      if (known.has(id) && /^\d+$/.test(value)) stock[id] = value;
    }
    const goal = typeof parsed.goal === "string" && /^\d+$/.test(parsed.goal) ? parsed.goal : "";
    return { stock, goal };
  } catch {
    return { stock: {}, goal: "" };
  }
}

function toStock(raw: Record<string, string>): Stock {
  const stock: Stock = {};
  for (const [id, value] of Object.entries(raw)) {
    if (value !== "") stock[id] = Number(value);
  }
  return stock;
}

export function Picker({
  label,
  options,
  chosen,
  onPick,
}: {
  label: string;
  options: { id: string; name: string }[];
  chosen: string;
  onPick: (id: string) => void;
}) {
  if (options.length === 0) return null;
  return (
    <nav className="calc-switch" aria-label={label}>
      {options.map((option) => (
        <button key={option.id} type="button" aria-current={option.id === chosen ? "page" : undefined} onClick={() => onPick(option.id)}>
          {option.name}
        </button>
      ))}
    </nav>
  );
}

function Results({
  can,
  unit,
  goalLabel,
  goal,
  onGoal,
  goalN,
  planned,
  now,
  label,
  xpHeading = "Herblore XP",
  mixHeading = "You will mix",
}: {
  can: number;
  unit: string;
  goalLabel: string;
  goal: string;
  onGoal: (value: string) => void;
  goalN: number;
  planned: Plan;
  now: Plan;
  label: (id: string) => string;
  xpHeading?: string;
  mixHeading?: string;
}) {
  const short = goalN > can;
  return (
    <section className="calc-result" aria-live="polite">
      <p className="kicker">You can make</p>
      <p className="calc-make">{can.toLocaleString("en-US")}</p>
      <p className="calc-unit">{unit}</p>
      <label className="goal">
        {goalLabel}
        <input inputMode="numeric" autoComplete="off" placeholder="0" value={goal} onChange={(event) => onGoal(digits(event.target.value))} />
      </label>
      {goalN > 0 && !short && <p className="enough">You have enough for this goal.</p>}
      {short && (
        <>
          <p className="short">Still short {goalN - can}.</p>
          {planned.missing.length > 0 && (
            <>
              <h2>Still need</h2>
              <ul className="need">
                {planned.missing.map((line) => (
                  <li key={line.id}>
                    <span className="need-name">
                      <img src={`/icons/${line.id}.png`} alt="" />
                      <span>{label(line.id)}</span>
                    </span>
                    <span>{formatExact(line.count)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <h2>{xpHeading}</h2>
      <p className="calc-xp">{formatExact(planned.xp)}</p>
      <p className="calc-note">
        {goalN === 0
          ? "From what you can make now."
          : short && planned.missing.length > 0
            ? "To make this goal, once you have the missing materials."
            : short
              ? "Your level cannot make the rest."
              : "To make this goal."}
      </p>
      {short && can > 0 && <p className="calc-note">From what you can make now: {formatExact(now.xp)}.</p>}
      {planned.crafts.length > 0 && (
        <>
          <h2>{mixHeading}</h2>
          <ul className="need">
            {planned.crafts.map((line) => (
              <li key={line.id}>
                <span className="need-name">
                  <img src={`/icons/${line.id}.png`} alt="" />
                  <span>
                    {formatExact(line.count)} {label(line.id)}
                  </span>
                </span>
                <span>{formatExact(line.xp)} XP</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

export function Fields({
  storageKey,
  groups,
  fields: inputs,
  level,
  onLevel,
  recipe,
  blocked,
  planFor,
  maxFor,
  title,
  guide,
  note,
  unit,
  goalLabel,
  shown,
  xpHeading,
  mixHeading,
  levelLabel = "Your Herblore level",
  toolbar,
}: {
  storageKey: string;
  groups: Group[];
  fields: Field[];
  level?: string;
  onLevel?: (value: string) => void;
  recipe?: string | null;
  blocked?: string | null;
  planFor: (goal: number, stock: Stock) => Plan;
  maxFor: (stock: Stock) => number;
  title: string;
  guide: string;
  note: string;
  unit: string;
  goalLabel: string;
  shown?: (field: Field) => boolean;
  xpHeading?: string;
  mixHeading?: string;
  levelLabel?: string;
  toolbar?: ReactNode;
}) {
  const known = useMemo(() => new Set(inputs.map((field) => field.id)), [inputs]);
  const labels = useMemo(() => new Map(inputs.map((field) => [field.id, field.label])), [inputs]);
  const [stockText, setStockText] = useState(() => loadStock(storageKey, known).stock);
  const [goal, setGoal] = useState(() => loadStock(storageKey, known).goal);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ stock: stockText, goal }));
  }, [storageKey, stockText, goal]);

  const stock = useMemo(() => toStock(stockText), [stockText]);
  const goalN = goal === "" ? 0 : Number(goal);
  const can = useMemo(() => maxFor(stock), [maxFor, stock]);
  const target = goalN > 0 ? goalN : can;
  const planned = useMemo(() => planFor(target, stock), [planFor, target, stock]);
  const now = useMemo(() => planFor(can, stock), [planFor, can, stock]);

  function setField(id: string, value: string) {
    const next = digits(value);
    setStockText((prev) => {
      const copy = { ...prev };
      if (next === "") delete copy[id];
      else copy[id] = next;
      return copy;
    });
  }

  return (
    <>
      <h1>{title}</h1>
      <p className="guide">{guide}</p>
      {onLevel && (
        <label className="goal">
          {levelLabel}
          <input
            inputMode="numeric"
            autoComplete="off"
            placeholder="1–120"
            value={level ?? ""}
            onChange={(event) => onLevel(levelDigits(event.target.value))}
          />
        </label>
      )}
      {toolbar}
      {recipe && <p className="recipe-name">{recipe}</p>}
      {blocked && <p className="short">{blocked}</p>}
      <Results
        can={can}
        unit={unit}
        goalLabel={goalLabel}
        goal={goal}
        onGoal={setGoal}
        goalN={goalN}
        planned={planned}
        now={now}
        label={(id) => labels.get(id) ?? id}
        xpHeading={xpHeading}
        mixHeading={mixHeading}
      />
      <p className="calc-note recipe-note">{note}</p>
      {groups.map((group) => {
        const groupFields = inputs.filter((field) => field.group === group.id && (!shown || shown(field)));
        if (groupFields.length === 0) return null;
        return (
          <section key={group.id} aria-labelledby={`calc-${storageKey}-${group.id}`}>
            <h2 id={`calc-${storageKey}-${group.id}`}>{group.title}</h2>
            {group.note && <p className="calc-note">{group.note}</p>}
            <div className="calc-grid">
              {groupFields.map((field) => (
                <label key={field.id}>
                  <img src={`/icons/${field.id}.png`} alt="" />
                  <span>{field.label}</span>
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="0"
                    value={stockText[field.id] ?? ""}
                    onChange={(event) => setField(field.id, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>
        );
      })}
      <button
        type="button"
        className="calc-clear"
        onClick={() => {
          setStockText({});
          setGoal("");
        }}
      >
        Clear numbers
      </button>
    </>
  );
}
