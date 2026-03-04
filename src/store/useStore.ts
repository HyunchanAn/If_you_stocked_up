import { create } from 'zustand';

type AppMode = 'PAST' | 'CURRENT';
type ThemeMode = 'dark' | 'light';

interface AppState {
    mode: AppMode;
    theme: ThemeMode;
    setMode: (mode: AppMode) => void;
    toggleTheme: () => void;
}

export const useAppStore = create<AppState>()((set: any) => ({
    mode: 'PAST',
    theme: 'dark', // 기본 다크모드
    setMode: (mode: AppMode) => set({ mode }),
    toggleTheme: () => set((state: AppState) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));
