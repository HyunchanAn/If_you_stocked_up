import { create } from 'zustand';
import { generateMockData } from '../services/mockDataGenerator';
import type { MarketData } from '../services/mockDataGenerator';

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'finished';

interface SimulationState {
    // 설정
    startDate: Date | null;
    endDate: Date | null;
    initialMoney: number;

    // 상태
    status: SimulationStatus;
    marketData: MarketData[];
    currentIndex: number;
    speedMultiplier: number; // 1, 2, 4, 8, 16, 32, 64

    // 포트폴리오
    balance: number;
    ownedQuantity: number;
    averageBuyPrice: number;

    // 액션
    setupSimulation: (start: Date, end: Date, money: number) => void;
    startSimulation: () => void;
    pauseSimulation: () => void;
    resetSimulation: () => void;
    setSpeed: (speed: number) => void;
    nextDay: () => void;
    buyStock: (quantity: number) => boolean;
    sellStock: (quantity: number) => boolean;
}

export const useSimulationStore = create<SimulationState>()((set: any, get: any) => ({
    startDate: null,
    endDate: null,
    initialMoney: 0,

    status: 'idle',
    marketData: [],
    currentIndex: 0,
    speedMultiplier: 1,

    balance: 0,
    ownedQuantity: 0,
    averageBuyPrice: 0,

    setupSimulation: (start: Date, end: Date, money: number) => {
        const data = generateMockData(start, end);
        set({
            startDate: start,
            endDate: end,
            initialMoney: money,
            balance: money,
            marketData: data,
            status: 'idle',
            currentIndex: 0,
            ownedQuantity: 0,
            averageBuyPrice: 0,
            speedMultiplier: 1,
        });
    },

    startSimulation: () => set({ status: 'running' }),
    pauseSimulation: () => set({ status: 'paused' }),
    resetSimulation: () => set({ status: 'idle' }), // setup 다시 호출 유도
    setSpeed: (speed: number) => set({ speedMultiplier: speed }),

    nextDay: () => {
        const { currentIndex, marketData } = get();
        if (currentIndex >= marketData.length - 1) {
            set({ status: 'finished' });
        } else {
            set({ currentIndex: currentIndex + 1 });
        }
    },

    buyStock: (quantity: number) => {
        const { balance, marketData, currentIndex, ownedQuantity, averageBuyPrice } = get();
        const currentPrice = marketData[currentIndex]?.price || 0;
        const totalCost = currentPrice * quantity;

        if (balance >= totalCost && totalCost > 0) {
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

    sellStock: (quantity: number) => {
        const { balance, marketData, currentIndex, ownedQuantity } = get();
        const currentPrice = marketData[currentIndex]?.price || 0;

        if (ownedQuantity >= quantity && quantity > 0) {
            set({
                balance: balance + (currentPrice * quantity),
                ownedQuantity: ownedQuantity - quantity,
                averageBuyPrice: ownedQuantity - quantity === 0 ? 0 : get().averageBuyPrice,
            });
            return true;
        }
        return false;
    }
}));
