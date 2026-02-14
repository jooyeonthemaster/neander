'use client';

import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  cursorVariant: 'default' | 'pointer' | 'text' | 'hidden' | 'expand';
  activeSection: string;
  isLoading: boolean;

  setMobileMenuOpen: (open: boolean) => void;
  setCursorVariant: (variant: UIState['cursorVariant']) => void;
  setActiveSection: (section: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  cursorVariant: 'default',
  activeSection: 'hero',
  isLoading: true,

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setCursorVariant: (variant) => set({ cursorVariant: variant }),
  setActiveSection: (section) => set({ activeSection: section }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
