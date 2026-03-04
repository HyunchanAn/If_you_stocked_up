import { useSimulationStore } from '../../../store/useSimulationStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Wallet, TrendingUp, PieChart } from 'lucide-react';

export function PortfolioSummary() {
    const { balance, ownedQuantity, averageBuyPrice, marketData, currentIndex, initialMoney } = useSimulationStore();

    const currentPrice = marketData[currentIndex]?.price || 0;
    const stockValue = ownedQuantity * currentPrice;
    const totalAssets = balance + stockValue;

    const totalCost = ownedQuantity * averageBuyPrice;
    const evaluationProfit = stockValue - totalCost;
    const evaluationProfitRate = totalCost > 0 ? (evaluationProfit / totalCost) * 100 : 0;

    const totalProfit = totalAssets - initialMoney;
    const totalProfitRate = (totalProfit / initialMoney) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Wallet size={16} />
                        보유 현금 (잔액)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.floor(balance).toLocaleString()} 원</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <TrendingUp size={16} />
                        보유 주식 가치
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{Math.floor(stockValue).toLocaleString()} 원</div>
                    <div className="text-sm mt-1">
                        {ownedQuantity > 0 ? (
                            <span className={evaluationProfit >= 0 ? "text-red-500 dark:text-red-400" : "text-blue-500 dark:text-blue-400"}>
                                {evaluationProfit >= 0 ? '+' : ''}{Math.floor(evaluationProfit).toLocaleString()} ({evaluationProfitRate.toFixed(2)}%)
                            </span>
                        ) : (
                            <span className="text-gray-400">보유 주식 없음</span>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                        <PieChart size={16} />
                        총 자산 / 누적 수익률
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {Math.floor(totalAssets).toLocaleString()} 원
                    </div>
                    <div className={`text-sm mt-1 font-medium ${totalProfit >= 0 ? "text-red-500 dark:text-red-400" : "text-blue-500 dark:text-blue-400"}`}>
                        {totalProfit >= 0 ? '+' : ''}{totalProfitRate.toFixed(2)}%
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
