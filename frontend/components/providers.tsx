'use client';

import React from "react"

import { Provider } from 'react-redux';
import { store } from '@/lib/store';
import { ThemeProvider } from '@/lib/theme-context';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <Provider store={store}>{children}</Provider>
    </ThemeProvider>
  );
}
