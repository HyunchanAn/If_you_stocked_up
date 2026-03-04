import { useState, useEffect } from 'react';
import { useSimulationStore } from '../../../store/useSimulationStore';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ShoppingCart } from 'lucide-react';

export function TradingPanel() {
    const { balance, activeSymbol, portfolios, buyStock, sellStock, marketData, currentIndex, status } = useSimulationStore();
    const [quantity, setQuantity] = useState('1');
    const [toastMsg, setToastMsg] = useState('');

    const currentPrice = (activeSymbol && marketData[activeSymbol]?.[currentIndex]?.price) || 0;
    const ownedQuantity = (activeSymbol && portfolios[activeSymbol]?.ownedQuantity) || 0;

    const numQuantity = parseInt(quantity.replace(/[^0-9]/g, '') || '0', 10);
    const totalCost = currentPrice * numQuantity;

    useEffect(() => {
        if (toastMsg) {
            const timer = setTimeout(() => setToastMsg(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [toastMsg]);

    const handleBuy = () => {
        if (numQuantity <= 0) return;
        if (buyStock(numQuantity)) {
            setToastMsg(`${numQuantity}주 매수 완료`);
        } else {
            setToastMsg('잔액이 부족합니다.');
        }
    };

    const handleSell = () => {
        if (numQuantity <= 0) return;
        if (sellStock(numQuantity)) {
            setToastMsg(`${numQuantity}주 매도 완료`);
        } else {
            setToastMsg('보유 수량이 부족합니다.');
        }
    };

    // 구매 가능 최대 수량
    const maxBuyQuantity = currentPrice > 0 ? Math.floor(balance / currentPrice) : 0;

    return (
        <Card className="h-full flex flex-col relative">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <ShoppingCart size={20} className="text-blue-500" />
                    빠른 매매 {activeSymbol && `(${activeSymbol})`}
                </CardTitle>
            </CardHeader>

            <CardContent className="pt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">현재가</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                            {Math.floor(currentPrice).toLocaleString()} 원
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">현재 보유량</span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{ownedQuantity} 주</span>
                        </div>

                        <div className="flex justify-between mt-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">주문 수량</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setQuantity(maxBuyQuantity.toString())}
                                    className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200"
                                >
                                    전액 매수
                                </button>
                                <button
                                    onClick={() => setQuantity(ownedQuantity.toString())}
                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded border border-blue-200"
                                >
                                    전량 매도
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                                className="text-right flex-1 font-bold text-lg"
                                disabled={status === 'finished'}
                            />
                            <span className="flex items-center text-gray-500 px-2 font-medium">주</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">예상 금액</span>
                        <span className="text-lg font-bold dark:text-gray-200">{Math.floor(totalCost).toLocaleString()} 원</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button
                        variant="danger"
                        size="lg"
                        onClick={handleBuy}
                        disabled={status === 'finished' || numQuantity <= 0 || totalCost > balance}
                        className="text-lg font-bold shadow-red-500/20 shadow-lg"
                    >
                        매수
                    </Button>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleSell}
                        disabled={status === 'finished' || numQuantity <= 0 || numQuantity > ownedQuantity}
                        className="bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-blue-500/20 shadow-lg"
                    >
                        매도
                    </Button>
                </div>

                {/* 간단한 토스트 메시지 */}
                {toastMsg && (
                    <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        {toastMsg}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
