import { create } from 'zustand';

/**
 * The last few API calls, kept in memory so a person testing the app can see
 * exactly what went to the live server and what came back -- without needing
 * `adb logcat` or someone else reading it for them. `__DEV__`-only: a release
 * build never records or shows this (see also the console logging in
 * client.ts, which this mirrors).
 */
export interface DevApiCall {
  id: string;
  method: string;
  url: string;
  requestBody?: unknown;
  status?: number;
  responseBody?: unknown;
  networkError?: boolean;
  startedAt: number;
  finishedAt?: number;
}

interface DevApiLogState {
  calls: DevApiCall[];
  start: (call: Pick<DevApiCall, 'method' | 'url' | 'requestBody'>) => string;
  finish: (id: string, patch: Partial<DevApiCall>) => void;
  clear: () => void;
}

const MAX_CALLS = 25;

export const useDevApiLog = create<DevApiLogState>((set) => ({
  calls: [],

  start: ({ method, url, requestBody }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      calls: [{ id, method, url, requestBody, startedAt: Date.now() }, ...state.calls].slice(
        0,
        MAX_CALLS
      ),
    }));
    return id;
  },

  finish: (id, patch) => {
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === id ? { ...call, ...patch, finishedAt: Date.now() } : call
      ),
    }));
  },

  clear: () => set({ calls: [] }),
}));
