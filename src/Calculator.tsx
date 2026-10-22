import { useEffect, useState } from "react";
import { calculators } from "./calculators";

const WHICH_KEY = "calc-which-v1";

function readWhich(): string {
  const saved = localStorage.getItem(WHICH_KEY);
  return calculators.some((entry) => entry.id === saved) ? (saved as string) : "elder";
}

export function Calculator() {
  const [which, setWhich] = useState(readWhich);

  useEffect(() => {
    localStorage.setItem(WHICH_KEY, which);
  }, [which]);

  const active = calculators.find((entry) => entry.id === which) ?? calculators[0];
  const Panel = active.Panel;

  return (
    <main id="content" className="calc">
      <nav className="calc-switch" aria-label="Calculators">
        {calculators.map((entry) => (
          <button key={entry.id} type="button" aria-current={entry.id === active.id ? "page" : undefined} onClick={() => setWhich(entry.id)}>
            {entry.label}
          </button>
        ))}
      </nav>
      <Panel />
    </main>
  );
}
