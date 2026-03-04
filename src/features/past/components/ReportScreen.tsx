import { useSimulationStore } from '../../../store/useSimulationStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { SimpleLineChart } from '../../../components/ui/Chart';
import { Award, ArrowLeftRight, Bitcoin, Coins } from 'lucide-react';
import { format } from 'date-fns';
import type { MarketData } from '../../../services/mockDataGenerator';

export function ReportScreen() {
    const { initialMoney, balance, ownedQuantity, marketData, resetSimulation } = useSimulationStore();

    if (marketData.length === 0) return null;

    const lastData = marketData[marketData.length - 1];
    const firstData = marketData[0];

    const finalStockValue = ownedQuantity * lastData.price;
    const finalAssets = balance + finalStockValue;
    const totalProfit = finalAssets - initialMoney;
    const profitRate = (totalProfit / initialMoney) * 100;

    // 투자 성향 분석
    const stockRatio = finalStockValue / finalAssets;
    let styleTitle = '안정 추구형';
    if (stockRatio > 0.8) styleTitle = '초공격 투자형';
    else if (stockRatio > 0.5) styleTitle = '적극 투자형';
    else if (stockRatio > 0.2) styleTitle = '위험 중립형';

    // 자산 비교 분석 로직 (비트코인, 금)
    const btcStartPrice = firstData.bitcoin;
    const btcEndPrice = lastData.bitcoin;
    const btcProfitRate = ((btcEndPrice - btcStartPrice) / btcStartPrice) * 100;

    const goldStartPrice = firstData.gold;
    const goldEndPrice = lastData.gold;
    const goldProfitRate = ((goldEndPrice - goldStartPrice) / goldStartPrice) * 100;

    // 차트를 위한 비교 데이터 생성
    const comparisonData = marketData.map((d: MarketData) => {
        // 100을 기준으로 한 지수(Index)화
        const myIndex = d.price / firstData.price * 100; // 단순 주가 기준 비교 (또는 자산 추이)
        const btcIndex = d.bitcoin / firstData.bitcoin * 100;
        const goldIndex = d.gold / firstData.gold * 100;
        return {
            date: d.date,
            '내 투자금(주가기준)': Math.round(myIndex),
            '비트코인': Math.round(btcIndex),
            '금': Math.round(goldIndex)
        };
    });

    return (
        <div className="p-4 md:p-6 h-full flex flex-col items-center overflow-y-auto">
            <div className="w-full max-w-4xl space-y-6 pb-20">

                <div className="text-center space-y-2 mb-8 mt-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">시뮬레이션 결과 보고서</h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        {format(new Date(firstData.date), 'yyyy년 MM월 dd일')} ~ {format(new Date(lastData.date), 'yyyy년 MM월 dd일')}
                    </p>
                </div>

                {/* 요약 카드 */}
                <Card className="border-t-4 border-t-blue-500 shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg text-gray-500">최종 수익률</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className={`text-5xl font-black mb-2 ${profitRate >= 0 ? 'text-red-500 dark:text-red-400' : 'text-blue-500 dark:text-blue-400'}`}>
                            {profitRate >= 0 ? '+' : ''}{profitRate.toFixed(2)}%
                        </div>
                        <div className="text-xl font-bold text-gray-700 dark:text-gray-300">
                            최종 자산: {Math.floor(finalAssets).toLocaleString()} 원
                        </div>
                        <div className="text-sm text-gray-400 mt-1">
                            (초기 자본: {initialMoney.toLocaleString()} 원)
                        </div>
                    </CardContent>
                </Card>

                {/* 분석 그리드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Award className="text-yellow-500" />
                                투자 성향 분석
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400 mb-4">
                                "{styleTitle}"
                            </div>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li className="flex justify-between">
                                    <span>최종 주식 비중:</span>
                                    <span className="font-bold">{(stockRatio * 100).toFixed(1)}%</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>최종 현금 비중:</span>
                                    <span className="font-bold">{((1 - stockRatio) * 100).toFixed(1)}%</span>
                                </li>
                            </ul>
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs leading-relaxed">
                                위험 요소: 단일 종목 집중 투자로 인한 리스크 노출<br />
                                안전 요소: 현금 비중 유지 시 하방 압력 방어 가능
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowLeftRight className="text-purple-500" />
                                만약 이때 다른 곳에 투자했다면?
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Bitcoin className="text-orange-500" />
                                        <span className="font-semibold">비트코인(BTC)</span>
                                    </div>
                                    <div className={`font-bold ${btcProfitRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                        {btcProfitRate >= 0 ? '+' : ''}{btcProfitRate.toFixed(2)}%
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800">
                                    <div className="flex items-center gap-2">
                                        <Coins className="text-yellow-600" />
                                        <span className="font-semibold">안전자산(금)</span>
                                    </div>
                                    <div className={`font-bold ${goldProfitRate >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                        {goldProfitRate >= 0 ? '+' : ''}{goldProfitRate.toFixed(2)}%
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 비교 차트 */}
                <Card>
                    <CardHeader>
                        <CardTitle>수익 지수 비교 차트 (Base = 100)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* SimpleLineChart는 단일 라인만 지원하므로, 여기서 비교를 위해 두 개의 라인을 그릴 수 있도록 확장하기엔 너무 크니, 비트코인 지수만 파란색으로 그려서 간단히 보여줌 (혹은 차트 래퍼 업그레이드) */}
                        <p className="text-xs text-gray-400 mb-4">* 본 차트는 시뮬레이션 기간 동안 대상 종목의 가격을 지수화(Index)한 선형 차트입니다.</p>
                        <SimpleLineChart data={comparisonData} xKey="date" yKey="내 투자금(주가기준)" color="#ef4444" />
                    </CardContent>
                </Card>

                <div className="flex justify-center mt-8">
                    <Button size="lg" onClick={resetSimulation} className="px-12 text-lg shadow-xl">
                        새로운 시뮬레이션 시작
                    </Button>
                </div>

            </div>
        </div>
    );
}
