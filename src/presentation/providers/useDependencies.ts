import { createContext, useContext } from "react";
import type { Dependencies } from "@/infrastructure/di/container";

export const DependencyContext = createContext<Dependencies | null>(null);

export function useDependencies(): Dependencies {
  const context = useContext(DependencyContext);
  if (!context) {
    throw new Error("useDependencies must be used within a DependencyProvider");
  }
  return context;
}
