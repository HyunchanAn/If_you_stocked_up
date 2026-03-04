import { useEffect, useState } from 'react';
import { useCurrentTradingStore } from '../../store/useCurrentTradingStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SimpleLineChart } from '../../components/ui/Chart';
import { Activity, Wallet, TrendingUp, ShoppingCart } from 'lucide-react';

export function CurrentTradingScreen() {
    const {
        balance,
        ownedQuantity,
        averageBuyPrice,
        currentPrice,
        dataPoints,
        buy,
        sell,
        tickPrice
    } = useCurrentTradingStore();

    const [quantity, setQuantity] = useState('1');
    const [toastMsg, setToastMsg] = useState('');

    // 1.5초마다 가격 틱 발생
    useEffect(() => {
        const interval = setInterval(() => {
            tickPrice();
        }, 1500);
        return () => clearInterval(interval);
    }, [tickPrice]);

    useEffect(() => {
        if (toastMsg) {
            const timer = setTimeout(() => setToastMsg(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [toastMsg]);

    const numQuantity = parseInt(quantity.replace(/[^0-9]/g, '') || '0', 10);
    const totalCost = currentPrice * numQuantity;

    const stockValue = ownedQuantity * currentPrice;
    const totalAssets = balance + stockValue;
    const totalInvestment = ownedQuantity * averageBuyPrice;
    const evaluationProfit = stockValue - totalInvestment;
    const profitRate = totalInvestment > 0 ? (evaluationProfit / totalInvestment) * 100 : 0;

    const maxBuyQuantity = currentPrice > 0 ? Math.floor(balance / currentPrice) : 0;

    const handleBuy = () => {
        if (buy(numQuantity)) setToastMsg(`${numQuantity}주 매수 체결`);
        else setToastMsg('잔액 부족');
    };

    const handleSell = () => {
        if (sell(numQuantity)) setToastMsg(`${numQuantity}주 매도 체결`);
        else setToastMsg('수량 부족');
    };

    return (
        <div className="p-4 md:p-6 h-full flex flex-col space-y-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-2">
                <Activity className="text-blue-500 animate-pulse" />
                <h2 className="text-2xl font-bold">실시간 가상 투자</h2>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded text-xs font-bold shadow-sm">
                    LIVE
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Wallet size={16} />
                            가상 잔고
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
                                    {evaluationProfit >= 0 ? '+' : ''}{Math.floor(evaluationProfit).toLocaleString()} ({profitRate.toFixed(2)}%)
                                </span>
                            ) : (
                                <span className="text-gray-400">보유 주식 없음</span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                            총 자산 (기본 100만원)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {Math.floor(totalAssets).toLocaleString()} 원
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1 min-h-[400px]">
                {/* 라이브 차트 */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <Card className="flex-1">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle>가상 종목 실시간 틱 차트</CardTitle>
                            <div className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                                {currentPrice.toLocaleString()} 원
                            </div>
                        </CardHeader>
                        <CardContent>
                            <SimpleLineChart data={dataPoints} xKey="time" yKey="price" color="#f97316" />
                        </CardContent>
                    </Card>
                </div>

                {/* 퀵 매매 패널 */}
                <div className="xl:col-span-1">
                    <Card className="h-full flex flex-col relative border-orange-200 dark:border-orange-900/50 shadow-lg shadow-orange-900/5">
                        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <ShoppingCart size={20} className="text-orange-500" />
                                호가 매매
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">주문 수량</label>
                                        <span
                                            className="text-xs text-orange-600 dark:text-orange-400 cursor-pointer hover:underline"
                                            onClick={() => setQuantity(maxBuyQuantity.toString())}
                                        >
                                            최대 매수: {maxBuyQuantity}주
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                                            className="text-right flex-1 font-bold text-lg"
                                        />
                                        <span className="flex items-center text-gray-500 px-2 font-medium">주</span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">예상 결제 금액</span>
                                    <span className="text-lg font-bold dark:text-gray-200">{Math.floor(totalCost).toLocaleString()} 원</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <Button
                                    variant="danger"
                                    size="lg"
                                    onClick={handleBuy}
                                    disabled={numQuantity <= 0 || totalCost > balance}
                                    className="text-lg font-bold shadow-red-500/20 shadow-lg"
                                >
                                    매수
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleSell}
                                    disabled={numQuantity <= 0 || numQuantity > ownedQuantity}
                                    className="bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-blue-500/20 shadow-lg"
                                >
                                    매도
                                </Button>
                            </div>

                            {toastMsg && (
                                <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                    {toastMsg}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
