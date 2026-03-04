import { create } from 'zustand';

interface DataPoint {
    time: string;
    price: number;
}

interface CurrentTradingState {
    balance: number;
    ownedQuantity: number;
    averageBuyPrice: number;
    currentPrice: number;
    dataPoints: DataPoint[];

    buy: (quantity: number) => boolean;
    sell: (quantity: number) => boolean;
    tickPrice: () => void;
}

export const useCurrentTradingStore = create<CurrentTradingState>()((set: any, get: any) => ({
    balance: 1000000, // 초기 자본금 100만 원
    ownedQuantity: 0,
    averageBuyPrice: 0,
    currentPrice: 50000,
    dataPoints: [{ time: new Date().toLocaleTimeString(), price: 50000 }],

    buy: (quantity: number) => {
        const { balance, currentPrice, ownedQuantity, averageBuyPrice } = get();
        const totalCost = currentPrice * quantity;

        if (balance >= totalCost && quantity > 0) {
            const newTotalMoney = (ownedQuantity * averageBuyPrice) + totalCost;
            const newQuantity = ownedQuantity + quantity;

            set({
                balance: balance - totalCost,
                ownedQuantity: newQuantity,
                averageBuyPrice: newTotalMoney / newQuantity,
            });
            return true;
        }
        return false;
    },

    sell: (quantity: number) => {
        const { balance, currentPrice, ownedQuantity } = get();

        if (ownedQuantity >= quantity && quantity > 0) {
            set({
                balance: balance + (currentPrice * quantity),
                ownedQuantity: ownedQuantity - quantity,
                averageBuyPrice: ownedQuantity - quantity === 0 ? 0 : get().averageBuyPrice,
            });
            return true;
        }
        return false;
    },

    tickPrice: () => {
        const { currentPrice, dataPoints } = get();
        // -2% ~ +2% 변동
        const changePercent = (Math.random() - 0.5) * 0.04;
        const newPrice = Math.max(100, Math.round(currentPrice * (1 + changePercent)));

        const newPoint = {
            time: new Date().toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            price: newPrice
        };

        // 최근 50개 데이터만 유지
        const newDataPoints = [...dataPoints, newPoint].slice(-50);

        set({
            currentPrice: newPrice,
            dataPoints: newDataPoints
        });
    }
}));
