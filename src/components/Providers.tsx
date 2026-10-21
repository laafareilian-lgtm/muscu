"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useWorkoutStorage } from "@/hooks/useWorkoutStorage";

type StorageContextValue = ReturnType<typeof useWorkoutStorage>;

const StorageContext = createContext<StorageContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const storage = useWorkoutStorage();
  return (
    <StorageContext.Provider value={storage}>{children}</StorageContext.Provider>
  );
}

export function useStorage(): StorageContextValue {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage must be used within Providers");
  return ctx;
}
