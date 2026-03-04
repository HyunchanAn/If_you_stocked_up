import { useAppStore } from '../../store/useStore';
import { Sun, Moon, TrendingUp } from 'lucide-react';

export function Header() {
    const { mode, theme, setMode, toggleTheme } = useAppStore();

    return (
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e293b] flex items-center justify-between px-6 shrink-0 transition-colors">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                    <TrendingUp size={20} />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                    If You Stocked Up
                </h1>
            </div>

            <div className="flex items-center gap-4">
                {/* 모드 탭 */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                    <button
                        onClick={() => setMode('PAST')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'PAST'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        과거 (연습)
                    </button>
                    <button
                        onClick={() => setMode('CURRENT')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'CURRENT'
                                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                    >
                        현재 (가상투자)
                    </button>
                </div>

                {/* 테마 토글 */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </header>
    );
}
