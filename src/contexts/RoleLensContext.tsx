import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'contractor' | 'employee';

export interface RoleLensConfig {
  role: UserRole;
  tone: string;
  uiFocus: string;
  defaultWidgets: string[];
  permissions: {
    canApprovePayroll: boolean;
    canEditContracts: boolean;
    canViewAnalytics: boolean;
    canManageUsers: boolean;
  };
}

const roleLensConfigs: Record<UserRole, RoleLensConfig> = {
  admin: {
    role: 'admin',
    tone: 'Neutral, directive',
    uiFocus: 'Global overview, SLA board',
    defaultWidgets: ['sla-alerts', 'audit-timeline', 'compliance', 'active-contracts'],
    permissions: {
      canApprovePayroll: true,
      canEditContracts: true,
      canViewAnalytics: true,
      canManageUsers: true,
    },
  },
  contractor: {
    role: 'contractor',
    tone: 'Friendly, reassuring',
    uiFocus: 'Self-service, payout status',
    defaultWidgets: ['next-payroll', 'contract-status', 'support-tickets'],
    permissions: {
      canApprovePayroll: false,
      canEditContracts: false,
      canViewAnalytics: false,
      canManageUsers: false,
    },
  },
  employee: {
    role: 'employee',
    tone: 'Warm, supportive',
    uiFocus: 'Payroll, benefits, time off',
    defaultWidgets: ['next-payroll', 'contract-status', 'benefits-summary', 'time-off-balance'],
    permissions: {
      canApprovePayroll: false,
      canEditContracts: false,
      canViewAnalytics: false,
      canManageUsers: false,
    },
  },
};

interface RoleLensContextType {
  currentLens: RoleLensConfig;
  setRole: (role: UserRole) => void;
  hasPermission: (permission: keyof RoleLensConfig['permissions']) => boolean;
}

const RoleLensContext = createContext<RoleLensContextType | null>(null);

export const RoleLensProvider = ({ children, initialRole = 'admin' }: { children: ReactNode; initialRole?: UserRole }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(initialRole);
  const currentLens = roleLensConfigs[currentRole] || roleLensConfigs.admin;

  const hasPermission = (permission: keyof RoleLensConfig['permissions']) => {
    return currentLens.permissions[permission];
  };

  return (
    <RoleLensContext.Provider value={{ currentLens, setRole: setCurrentRole, hasPermission }}>
      {children}
    </RoleLensContext.Provider>
  );
};

export const useRoleLens = () => {
  const context = useContext(RoleLensContext);
  if (!context) {
    throw new Error('useRoleLens must be used within RoleLensProvider');
  }
  return context;
};
