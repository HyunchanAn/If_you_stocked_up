import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAppStore } from '../../store/useStore';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const { theme } = useAppStore();

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white transition-colors">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#0f172a]/50">
                    {children}
                </main>
            </div>
        </div>
    );
}
