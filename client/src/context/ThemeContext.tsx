import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';

const PALETTE: Record<Theme, { fg: string; bg: string; muted: string }> = {
  dark: { fg: '#ffffff', bg: '#000000', muted: '#a3a3a3' },
  light: { fg: '#000000', bg: '#ffffff', muted: '#525252' },
};

type ThemeValue = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  fg: string;
  bg: string;
  muted: string;
};

const ThemeContext = createContext<ThemeValue | null>(null);

function getInitial(): Theme {
  try {
    const stored = localStorage.getItem('corp_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    try {
      localStorage.setItem('corp_theme', theme);
    } catch { /* ignore */ }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const value: ThemeValue = { theme, toggle, setTheme, ...PALETTE[theme] };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
