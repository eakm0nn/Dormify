import React, { createContext, useContext, useMemo } from 'react';
import { useApiResource } from '../hooks/useApiResource';
import type { Dormitory } from '../types/api';

interface DormitoryContextValue {
  dormitory: Dormitory | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}
const DormitoryContext = createContext<DormitoryContextValue | null>(null);
// Presentation only: select one installation's property without changing the API or database.
export const DormitoryProvider = ({ children }: { children: React.ReactNode }) => {
  const selectedId = import.meta.env.VITE_DORMITORY_ID;
  const { data, loading, error, refresh } = useApiResource<Dormitory[] | Dormitory>(
    selectedId ? `/api/properties/${encodeURIComponent(selectedId)}` : '/api/properties',
    'ไม่สามารถโหลดข้อมูลหอพักได้ กรุณาลองอีกครั้ง',
  );
  const value = useMemo(() => {
    const properties = data ? (Array.isArray(data) ? data : [data]) : [];
    const ambiguous = properties.length > 1;
    return {
      dormitory: error || ambiguous ? null : properties[0] || null,
      loading,
      error: error || (ambiguous ? 'ข้อมูลหอพักยังไม่พร้อมแสดง กรุณาติดต่อผู้ดูแลระบบ' : ''),
      refresh,
    };
  }, [data, loading, error, refresh]);
  return <DormitoryContext.Provider value={value}>{children}</DormitoryContext.Provider>;
};
export const useDormitory = () => {
  const context = useContext(DormitoryContext);
  if (!context) throw new Error('useDormitory must be used inside DormitoryProvider');
  return context;
};
