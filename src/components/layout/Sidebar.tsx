import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface IndexData {
    name: string;
    value: number;
    change: number;
    changeRate: number;
}

const mockIndices: IndexData[] = [
    { name: 'KOSPI', value: 2650.15, change: 15.2, changeRate: 0.58 },
    { name: 'KOSDAQ', value: 860.42, change: -4.3, changeRate: -0.5 },
];

export function Sidebar() {
    return (
        <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0f172a] hidden md:flex flex-col shrink-0 transition-colors">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                    시장 지표
                </h2>
                <div className="space-y-4">
                    {mockIndices.map((index) => {
                        const isPositive = index.change >= 0;
                        return (
                            <div key={index.name} className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {index.name}
                                </span>
                                <div className="flex items-baseline justify-between mt-1">
                                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                                        {index.value.toLocaleString()}
                                    </span>
                                    <div
                                        className={cn(
                                            "flex items-center text-sm font-medium",
                                            isPositive ? "text-red-500 dark:text-red-400" : "text-blue-500 dark:text-blue-400"
                                        )}
                                    >
                                        {isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                                        {isPositive ? '+' : ''}{index.changeRate}%
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 추가적인 사이드바 콘텐츠가 들어갈 자리 */}
            <div className="flex-1 p-4">
                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800/30">
                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
                        트레이딩 팁
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                        과거의 데이터를 기반으로 모의 투자를 진행해 보세요. 배속을 조절하여 빠른 시간 내에 시장의 흐름을 읽는 연습을 할 수 있습니다.
                    </p>
                </div>
            </div>
        </aside>
    );
}
