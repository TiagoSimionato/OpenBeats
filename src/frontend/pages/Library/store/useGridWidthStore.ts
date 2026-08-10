'use client';

import { create } from 'zustand';

type GridWidthStore = {
  setWidth: (width: number) => void;
  width?: number;
};

export const useGridWidthStore = create<GridWidthStore>(set => ({
  setWidth: (width: number) => set({ width }),
  width: undefined,
}));
