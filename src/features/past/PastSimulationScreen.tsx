import { useSimulationStore } from '../../store/useSimulationStore';
import { SimulationSetup } from './components/SimulationSetup';
import { PortfolioSummary } from './components/PortfolioSummary';
import { TimeController } from './components/TimeController';
import { TradingPanel } from './components/TradingPanel';
import { ReportScreen } from './components/ReportScreen';
import { SimpleLineChart } from '../../components/ui/Chart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

export function PastSimulationScreen() {
    const { status, marketData, currentIndex } = useSimulationStore();

    if (status === 'idle') {
        return <SimulationSetup />;
    }
    if (status === 'finished') {
        return <ReportScreen />;
    }

    // 차트에 그릴 데이터 (현재 인덱스까지만)
    const chartData = marketData.slice(0, currentIndex + 1);

    return (
        <div className="p-4 md:p-6 h-full flex flex-col space-y-6 overflow-y-auto">
            <TimeController />
            <PortfolioSummary />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px]">
                {/* 차트 영역 */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <Card className="flex-1">
                        <CardHeader className="pb-2">
                            <CardTitle>종목 차트 시뮬레이션</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SimpleLineChart data={chartData} xKey="date" yKey="price" />
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
