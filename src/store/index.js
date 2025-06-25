import { create } from "zustand";
import { createAuthSlice } from "./slices/auth-slice";
import { createChatSlice } from "./slices/chat-slice";

// Create the Zustand store
export const useAppStore = create((...a) => ({
  ...createAuthSlice(...a), // Pass Zustand's `set` and `get` to the slice
  ...createChatSlice(...a), // Pass Zustand's `set` and `get` to the slice
}));
