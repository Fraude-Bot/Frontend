import React, { ReactNode, useMemo } from "react";
import {
  createDependencies,
  Dependencies,
} from "@/infrastructure/di/container";
import { DependencyContext } from "@/presentation/providers/useDependencies";

interface DependencyProviderProps {
  children: ReactNode;
  overrides?: Partial<Dependencies>;
}

export const DependencyProvider: React.FC<DependencyProviderProps> = ({
  children,
  overrides,
}) => {
  const contextValue = useMemo(() => {
    return { ...createDependencies(), ...overrides };
  }, [overrides]);

  return (
    <DependencyContext.Provider value={contextValue}>
      {children}
    </DependencyContext.Provider>
  );
};
