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

    symbol: string;

    buy: (quantity: number) => boolean;
    sell: (quantity: number) => boolean;
    setSymbol: (sym: string) => void;
    updateLiveData: (newDataPoints: DataPoint[]) => void;
    resetPortfolio: () => void;
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

    symbol: '005930.KS', // Default to Samsung

    setSymbol: (sym: string) => set({ symbol: sym }),

    updateLiveData: (newDataPoints: DataPoint[]) => {
        if (!newDataPoints || newDataPoints.length === 0) return;
        const currentPrice = newDataPoints[newDataPoints.length - 1].price;
        set({
            currentPrice,
            dataPoints: newDataPoints
        });
    },

    resetPortfolio: () => {
        set({
            balance: 1000000,
            ownedQuantity: 0,
            averageBuyPrice: 0,
            currentPrice: 0,
            dataPoints: []
        });
    }
}));
