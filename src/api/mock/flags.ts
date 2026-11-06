import { useSyncExternalStore } from 'react';

export type MockFlags = { fail503: boolean; offline: boolean; slow: boolean };

let flags: MockFlags = { fail503: false, offline: false, slow: false };
const listeners = new Set<() => void>();

export function getMockFlags(): MockFlags {
  return flags;
}

export function setMockFlag(k: keyof MockFlags, v: boolean): void {
  if (flags[k] === v) return;
  flags = { ...flags, [k]: v }; // nueva referencia para useSyncExternalStore
  listeners.forEach((l) => l());
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useMockFlags(): [MockFlags, (k: keyof MockFlags, v: boolean) => void] {
  const f = useSyncExternalStore(subscribe, getMockFlags, getMockFlags);
  return [f, setMockFlag];
}
