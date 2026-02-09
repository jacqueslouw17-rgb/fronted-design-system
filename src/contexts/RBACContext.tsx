/**
 * RBAC Context Provider
 * Shares RBAC state across all components to ensure deleted templates persist
 */

import { createContext, useContext, ReactNode } from 'react';
import { useRBAC as useRBACHook } from '@/hooks/useRBAC';

type RBACContextType = ReturnType<typeof useRBACHook>;

const RBACContext = createContext<RBACContextType | null>(null);

export function RBACProvider({ children }: { children: ReactNode }) {
  const rbac = useRBACHook();
  return <RBACContext.Provider value={rbac}>{children}</RBACContext.Provider>;
}

export function useRBACContext(): RBACContextType {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBACContext must be used within an RBACProvider');
  }
  return context;
}
