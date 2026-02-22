// stores/tabStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TabState {
  activeTab: string;
  isMobileMenuOpen: boolean;
  setActiveTab: (tab: string) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const useTabStore = create<TabState>()(
  persist(
    (set) => ({
      activeTab: 'home',
      isMobileMenuOpen: false,
      setActiveTab: (tab) => set({ activeTab: tab, isMobileMenuOpen: false }),
      setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: 'commuter-tab-storage', 
    }
  )
);