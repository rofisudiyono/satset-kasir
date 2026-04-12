import { createStore } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV();

/** Shared Jotai store — used by both JotaiProvider and the axios client. */
export const appStore = createStore();

export const appStorage = {
  setItem: (key: string, value: string) => storage.set(key, value),
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value === undefined ? null : value;
  },
  removeItem: (key: string) => storage.remove(key),
  clear: () => storage.clearAll(),
};

export const atomWithMMKV = <T>(key: string, initialValue: T) =>
  atomWithStorage<T>(
    key,
    initialValue,
    createJSONStorage<T>(() => appStorage),
    { getOnInit: true },
  );
