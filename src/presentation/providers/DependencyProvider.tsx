import React, { ReactNode, useMemo } from "react";
import type { Dependencies } from "@/application/dependencies";
import { DependencyContext } from "@/presentation/providers/useDependencies";

type DependencyProviderProps = {
  children: ReactNode;
  dependencies: Dependencies;
  overrides?: Partial<Dependencies>;
};

export const DependencyProvider: React.FC<DependencyProviderProps> = ({
  children,
  dependencies,
  overrides,
}) => {
  const contextValue = useMemo(() => {
    return { ...dependencies, ...overrides };
  }, [dependencies, overrides]);

  return (
    <DependencyContext.Provider value={contextValue}>
      {children}
    </DependencyContext.Provider>
  );
};
