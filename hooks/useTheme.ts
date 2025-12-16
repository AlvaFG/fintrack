import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme(initialTheme: Theme = 'system') {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Detectar preferencia del sistema
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Resolver tema actual
  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return getSystemTheme();
    }
    return currentTheme;
  };

  // Aplicar tema al documento
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);

    // Aplicar clase dark al html
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Escuchar cambios en preferencias del sistema
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? 'dark' : 'light');
      const root = document.documentElement;
      if (e.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    // Usar addEventListener para navegadores modernos
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Cargar tema desde localStorage al inicio
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme,
  };
}
