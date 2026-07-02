/**
 * Contexto de Autenticación, Roles y Selección de Unidad de Negocio
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, BusinessUnit, UserInfo } from '../types';

interface AuthContextType {
  currentUser: UserInfo;
  setCurrentRole: (role: UserRole) => void;
  selectedUnit: BusinessUnit | 'all';
  setSelectedUnit: (unit: BusinessUnit | 'all') => void;
  usersList: UserInfo[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const USERS_LIST: UserInfo[] = [
  {
    id: 'dani',
    name: 'Dani (Admin CRM)',
    roleTitle: 'Inteligencia Comercial & Admin CRM',
    unit: 'all',
    permissions: {
      canEditAll: true,
      canViewAll: true,
      canManageConfig: true,
      canExport: true
    }
  },
  {
    id: 'oscar',
    name: 'Óscar Benavides',
    roleTitle: 'Dirección Comercial & Estrategia',
    unit: 'all',
    permissions: {
      canEditAll: true,
      canViewAll: true,
      canManageConfig: true,
      canExport: true
    }
  },
  {
    id: 'carlos',
    name: 'Carlos Mendoza',
    roleTitle: 'Seguimiento Operativo & Reactivaciones',
    unit: 'all',
    permissions: {
      canEditAll: true,
      canViewAll: true,
      canManageConfig: false,
      canExport: true
    }
  },
  {
    id: 'agendadora',
    name: 'Valeria (Agendadora)',
    roleTitle: 'Calificación de Leads & Citas',
    unit: 'all',
    permissions: {
      canEditAll: false,
      canViewAll: true,
      canManageConfig: false,
      canExport: false
    }
  },
  {
    id: 'vendedor',
    name: 'Esteban / Vendedores Senior',
    roleTitle: 'Cierre de Negocios & Contratos',
    unit: 'all',
    permissions: {
      canEditAll: false,
      canViewAll: true,
      canManageConfig: false,
      canExport: false
    }
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserInfo>(USERS_LIST[0]); // Dani (admin) por defecto
  const [selectedUnit, setSelectedUnit] = useState<BusinessUnit | 'all'>('all');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const setCurrentRole = (roleId: UserRole) => {
    const found = USERS_LIST.find(u => u.id === roleId);
    if (found) {
      setCurrentUser(found);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentRole,
        selectedUnit,
        setSelectedUnit,
        usersList: USERS_LIST,
        activeTab,
        setActiveTab
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
