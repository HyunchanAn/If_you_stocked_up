import { useState, useMemo } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { SimulationSetup } from './components/SimulationSetup';
import { PortfolioSummary } from './components/PortfolioSummary';
import { TimeController } from './components/TimeController';
import { TradingPanel } from './components/TradingPanel';
import { ReportScreen } from './components/ReportScreen';
import { CandlestickChart } from '../../components/ui/Chart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { subDays, subMonths, subYears, startOfYear } from 'date-fns';

type ViewRange = 'sim' | '1d' | '5d' | '1mo' | '6mo' | 'ytd' | '1y' | '5y' | 'max';

export function PastSimulationScreen() {
    const { status, symbols, activeSymbol, setActiveSymbol, marketData, preSimulationData, tradeHistory, currentIndex, startDate } = useSimulationStore();
    const [viewRange, setViewRange] = useState<ViewRange>('sim');

    // 활성 종목의 이전 차트 내역
    const preSimData = activeSymbol && preSimulationData[activeSymbol] ? preSimulationData[activeSymbol] : [];

    // 현재 진행 중인 시뮬레이션 데이터
    const activeSimData = activeSymbol && marketData[activeSymbol]
        ? marketData[activeSymbol].slice(0, currentIndex + 1)
        : [];

    // viewRange에 맞춰서 이전 데이터 잘라내고 + 시뮬레이션 데이터 이어붙이기
    const chartData = useMemo(() => {
        let baseData = activeSimData;

        if (viewRange !== 'sim' && startDate) {
            let cutoffDate: Date | null = null;
            switch (viewRange) {
                case '1d': cutoffDate = subDays(startDate, 1); break;
                case '5d': cutoffDate = subDays(startDate, 5); break;
                case '1mo': cutoffDate = subMonths(startDate, 1); break;
                case '6mo': cutoffDate = subMonths(startDate, 6); break;
                case 'ytd': cutoffDate = startOfYear(startDate); break;
                case '1y': cutoffDate = subYears(startDate, 1); break;
                case '5y': cutoffDate = subYears(startDate, 5); break;
                case 'max': cutoffDate = new Date('1900-01-01'); break;
            }

            if (cutoffDate) {
                const filteredPreSim = preSimData.filter(d => new Date(d.date) >= cutoffDate!);
                baseData = [...filteredPreSim, ...activeSimData];
            }
        }

        // 매매 내역(Trade History)을 날짜 기반 맵으로 변환 (O(M))
        const trades = activeSymbol && tradeHistory[activeSymbol] ? tradeHistory[activeSymbol] : [];
        if (trades.length === 0) return baseData;

        const tradeMap: Record<string, { buy?: number; sell?: number }> = {};
        for (const t of trades) {
            if (!tradeMap[t.date]) tradeMap[t.date] = {};
            if (t.type === 'buy') tradeMap[t.date].buy = t.price;
            else if (t.type === 'sell') tradeMap[t.date].sell = t.price;
        }

        // 단일 패스로 데이터 병합 (O(N))
        return baseData.map(d => {
            const dayTrade = tradeMap[d.date];
            if (!dayTrade) return d;

            return {
                ...d,
                ...((dayTrade.buy !== undefined) && { buyPrice: dayTrade.buy }),
                ...((dayTrade.sell !== undefined) && { sellPrice: dayTrade.sell })
            };
        });

    }, [viewRange, activeSimData, preSimData, startDate, tradeHistory, activeSymbol]);

    if (status === 'idle') {
        return <SimulationSetup />;
    }
    if (status === 'finished') {
        return <ReportScreen />;
    }


    const ranges: { label: string, value: ViewRange }[] = [
        { label: '시뮬레이션만', value: 'sim' },
        { label: '1일', value: '1d' },
        { label: '5일', value: '5d' },
        { label: '1개월', value: '1mo' },
        { label: '6개월', value: '6mo' },
        { label: '연초', value: 'ytd' },
        { label: '1년', value: '1y' },
        { label: '5년', value: '5y' },
        { label: '최대', value: 'max' },
    ];

    return (
        <div className="p-4 md:p-6 h-full flex flex-col space-y-6 overflow-y-auto">
            <TimeController />
            <PortfolioSummary />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px]">
                {/* 차트 영역 */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <Card className="flex-1">
                        <CardHeader className="pb-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <CardTitle>종목 차트 시뮬레이션</CardTitle>
                                {symbols.length > 1 && (
                                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto max-w-full">
                                        {symbols.map(sym => (
                                            <button
                                                key={sym}
                                                onClick={() => setActiveSymbol(sym)}
                                                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-all ${activeSymbol === sym
                                                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                                    }`}
                                            >
                                                {sym}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex bg-gray-50 dark:bg-gray-800/50 p-1 mb-4 rounded-lg overflow-x-auto gap-1">
                                {ranges.map(range => (
                                    <button
                                        key={range.value}
                                        onClick={() => setViewRange(range.value)}
                                        className={`px-3 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-all flex-1 ${viewRange === range.value
                                            ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                            <div className="h-[350px]">
                                <CandlestickChart data={chartData} xKey="date" height={350} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 주문 패널 */}
                <div className="xl:col-span-1">
                    <TradingPanel />
                </div>
            </div>
        </div>
    );
}
