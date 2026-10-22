import { useEffect, useState } from "react";

export function useLevel(key: string) {
  const [level, setLevel] = useState(() => {
    const saved = localStorage.getItem(key) ?? "";
    return /^\d+$/.test(saved) && Number(saved) <= 120 ? String(Number(saved)) : "";
  });
  useEffect(() => {
    localStorage.setItem(key, level);
  }, [key, level]);
  return [level, setLevel] as const;
}

export function useHerbLevel() {
  return useLevel("herb-level-v1");
}

export function useChoice(key: string, open: { id: string }[], prefer: string) {
  const [picked, setPicked] = useState(() => localStorage.getItem(key) || prefer);
  const chosen = open.some((entry) => entry.id === picked) ? picked : (open.find((entry) => entry.id === prefer)?.id ?? open.at(-1)?.id ?? "");
  useEffect(() => {
    if (chosen) localStorage.setItem(key, chosen);
  }, [key, chosen]);
  return [chosen, setPicked] as const;
}
