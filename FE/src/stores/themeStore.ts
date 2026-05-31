import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
  setDark: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: typeof window !== 'undefined' 
        ? localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark')
        : false,

      toggleTheme: () =>
        set((state) => {
          const newDark = !state.isDark;
          if (typeof window !== 'undefined') {
            if (newDark) {
              document.documentElement.classList.add('dark');
              localStorage.setItem('theme', 'dark');
            } else {
              document.documentElement.classList.remove('dark');
              localStorage.setItem('theme', 'light');
            }
          }
          return { isDark: newDark };
        }),

      setDark: (isDark: boolean) => {
        if (typeof window !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
          } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
          }
        }
        set({ isDark });
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);
