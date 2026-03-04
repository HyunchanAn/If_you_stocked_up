import { useState } from 'react';
import { useSimulationStore } from '../../../store/useSimulationStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Coins, CalendarRange, Search, Loader2 } from 'lucide-react';
import { addDays, format, differenceInDays } from 'date-fns';

export function SimulationSetup() {
    const { setupSimulation } = useSimulationStore();

    // 기본값 설정 (과거 100일 전부터 오늘까지)
    const [symbol, setSymbol] = useState('005930.KS');
    const [startDate, setStartDate] = useState(format(addDays(new Date(), -100), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [seedMoney, setSeedMoney] = useState('10000000'); // 1000만 원
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const money = parseInt(seedMoney.replace(/[^0-9]/g, ''), 10);

        if (!symbol.trim()) {
            alert('종목 코드를 입력해주세요.');
            return;
        }
        if (start >= end) {
            alert('종료 날짜는 시작 날짜보다 미래여야 합니다.');
            return;
        }
        if (differenceInDays(end, start) < 7) {
            alert('시뮬레이션 기간은 최소 7일 이상이어야 합니다.');
            return;
        }
        if (money < 100000) {
            alert('최소 100,000원의 자본금이 필요합니다.');
            return;
        }

        setIsLoading(true);
        try {
            const symbolsArray = symbol.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
            if (symbolsArray.length === 0) {
                alert('유효한 종목 코드를 입력해주세요.');
                setIsLoading(false);
                return;
            }
            await setupSimulation(symbolsArray, start, end, money);
        } catch (error: any) {
            alert('데이터를 불러오는데 실패했습니다: ' + (error.message || '알 수 없는 오류'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center p-6 h-full w-full">
            <Card className="w-full max-w-lg shadow-xl shadow-blue-900/5 dark:shadow-none border-t-4 border-t-blue-600">
                <CardHeader className="pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <CalendarRange className="text-blue-500" />
                        과거로 돌아가기
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        투자 연습을 위한 기간과 초기 자본금을 설정해주세요.
                    </p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            종목 코드 (Yahoo Finance 기준)
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                type="text"
                                placeholder="예: 005930.KS, AAPL, TSLA"
                                value={symbol}
                                onChange={(e) => setSymbol(e.target.value)}
                                className="pl-9 uppercase"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                시작 날짜
                            </label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={format(addDays(new Date(), -7), 'yyyy-MM-dd')}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                종료 날짜
                            </label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                max={format(new Date(), 'yyyy-MM-dd')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Coins size={16} className="text-yellow-500" />
                            시드 머니 (기본 자본금)
                        </label>
                        <div className="relative">
                            <Input
                                type="text"
                                value={Number(seedMoney).toLocaleString()}
                                onChange={(e) => setSeedMoney(e.target.value.replace(/[^0-9]/g, ''))}
                                className="pr-12 text-right font-medium"
                            />
                            <span className="absolute right-3 top-2.5 text-gray-500 text-sm font-medium">원</span>
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 text-lg shadow-blue-500/25 shadow-lg flex items-center justify-center gap-2"
                        onClick={handleStart}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                데이터 불러오는 중...
                            </>
                        ) : (
                            '트레이딩 시작'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
