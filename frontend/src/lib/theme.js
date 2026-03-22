'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { runWithViewTransition } from './navigation';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';

    const saved = localStorage.getItem('taskflow-theme');
    if (saved === 'dark' || saved === 'light') return saved;

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('taskflow-theme', theme);
  }, [theme]);

  const applyTheme = (next) => {
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('taskflow-theme', next);
    setTheme(next);
  };

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';

    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.documentElement.classList.add('theme-switching');
      const transition = runWithViewTransition(() => {
        applyTheme(next);
      });

      if (transition) {
        transition.finished
          .catch(() => null)
          .finally(() => {
            document.documentElement.classList.remove('theme-switching');
          });
        return;
      }

      window.setTimeout(() => {
        document.documentElement.classList.remove('theme-switching');
      }, 320);
      return;
    }

    document.documentElement.classList.add('theme-switching');
    applyTheme(next);
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-switching');
    }, 320);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
