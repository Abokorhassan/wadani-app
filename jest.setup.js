/* eslint-disable no-undef */

// MMKV is a native module, so tests use an in-memory stand-in.
jest.mock('react-native-mmkv', () => ({
  createMMKV: () => {
    const store = new Map();
    return {
      getString: (key) => store.get(key),
      set: (key, value) => store.set(key, value),
      remove: (key) => store.delete(key),
      contains: (key) => store.has(key),
      clearAll: () => store.clear(),
    };
  },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => undefined),
  deleteItemAsync: jest.fn(async () => undefined),
}));
