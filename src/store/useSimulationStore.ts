import { create } from 'zustand';
import { fetchHistoricalData, fetchPreSimulationData } from '../services/apiService';
import type { MarketData } from '../services/apiService';

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface Portfolio {
    ownedQuantity: number;
    averageBuyPrice: number;
}

export interface Transaction {
    type: 'buy' | 'sell';
    date: string;
    price: number;
    quantity: number;
}

export interface SimulationState {
    // 설정
    symbols: string[];
    activeSymbol: string | null;
    startDate: Date | null;
    endDate: Date | null;
    initialMoney: number;

    // 진행 상태
    status: SimulationStatus;
    currentIndex: number;
    speedInterval: number; // 1일 틱 지연 시간 (ms)

    // 자산 및 포트폴리오 (단일 잔고, 종목별 포트폴리오)
    balance: number;
    portfolios: Record<string, Portfolio>;

    // 주가 데이터 (종목코드별 배열)
    marketData: Record<string, MarketData[]>;
    preSimulationData: Record<string, MarketData[]>;

    // 거래 내역
    tradeHistory: Record<string, Transaction[]>;

    // 액션
    setupSimulation: (symbols: string[], start: Date, end: Date, money: number) => Promise<void>;
    setActiveSymbol: (symbol: string) => void;
    startSimulation: () => void;
    pauseSimulation: () => void;
    resetSimulation: () => void;
    setSpeedInterval: (interval: number) => void;
    nextDay: () => void;
    buyStock: (quantity: number) => boolean;
    sellStock: (quantity: number) => boolean;
}

export const useSimulationStore = create<SimulationState>()((set: any) => ({
    symbols: [],
    activeSymbol: null,
    startDate: null,
    endDate: null,
    initialMoney: 0,

    status: 'idle',
    currentIndex: 0,
    speedInterval: 1000,

    balance: 0,
    portfolios: {},
    marketData: {},
    preSimulationData: {},
    tradeHistory: {},

    setupSimulation: async (symbols: string[], start: Date, end: Date, money: number) => {
        const marketDataRecord: Record<string, MarketData[]> = {};
        const preDataRecord: Record<string, MarketData[]> = {};
        const portfoliosRecord: Record<string, Portfolio> = {};
        const tradeHistoryRecord: Record<string, Transaction[]> = {};

        // 여러 종목 데이터 동시 Fetch
        await Promise.all(symbols.map(async (sym) => {
            const [data, preData] = await Promise.all([
                fetchHistoricalData(sym, start, end),
                fetchPreSimulationData(sym, start)
            ]);

            if (data && data.length > 0) {
                marketDataRecord[sym] = data;
                preDataRecord[sym] = preData || [];
                portfoliosRecord[sym] = { ownedQuantity: 0, averageBuyPrice: 0 };
                tradeHistoryRecord[sym] = [];
            }
        }));

        if (Object.keys(marketDataRecord).length === 0) {
            throw new Error('시뮬레이션 기간 동안의 데이터가 없거나 잘못된 종목입니다.');
        }

        set({
            symbols: Object.keys(marketDataRecord),
            activeSymbol: Object.keys(marketDataRecord)[0],
            startDate: start,
            endDate: end,
            initialMoney: money,
            balance: money,
            marketData: marketDataRecord,
            preSimulationData: preDataRecord,
            portfolios: portfoliosRecord,
            tradeHistory: tradeHistoryRecord,
            status: 'paused',
            currentIndex: 0,
            speedInterval: 1000,
        });
    },

    setActiveSymbol: (symbol: string) => set({ activeSymbol: symbol }),
    startSimulation: () => set({ status: 'running' }),
    pauseSimulation: () => set({ status: 'paused' }),
    resetSimulation: () => set({
        symbols: [],
        activeSymbol: null,
        status: 'idle',
        currentIndex: 0,
        balance: 0,
        portfolios: {},
        marketData: {},
        preSimulationData: {},
        tradeHistory: {},
    }),
    setSpeedInterval: (interval: number) => set({ speedInterval: interval }),
    nextDay: () => set((state: SimulationState) => {
        const anySymbol = state.symbols[0];
        const maxIndex = state.marketData[anySymbol]?.length - 1 || 0;

        if (state.currentIndex >= maxIndex) {
            return { status: 'finished' };
        } else {
            return { currentIndex: state.currentIndex + 1 };
        }
    }),

    buyStock: (quantity: number) => {
        let success = false;
        set((state: SimulationState) => {
            const { activeSymbol, balance, currentIndex, marketData, portfolios } = state;
            if (!activeSymbol) return state;

            const currentData = marketData[activeSymbol]?.[currentIndex];
            if (!currentData || currentData.price <= 0) return state;

            const cost = currentData.price * quantity;
            if (balance >= cost) {
                const portfolio = portfolios[activeSymbol];
                const totalInvested = portfolio.ownedQuantity * portfolio.averageBuyPrice;
                const newTotalInvested = totalInvested + cost;
                const newOwnedQuantity = portfolio.ownedQuantity + quantity;
                const newAverageBuyPrice = newTotalInvested / newOwnedQuantity;

                const newTrade: Transaction = {
                    type: 'buy',
                    date: currentData.date,
                    price: currentData.price,
                    quantity
                };

                success = true;
                return {
                    balance: balance - cost,
                    portfolios: {
                        ...portfolios,
                        [activeSymbol]: {
                            ownedQuantity: newOwnedQuantity,
                            averageBuyPrice: newAverageBuyPrice
                        }
                    },
                    tradeHistory: {
                        ...state.tradeHistory,
                        [activeSymbol]: [...(state.tradeHistory[activeSymbol] || []), newTrade]
                    }
                };
            }
            return state;
        });
        return success;
    },
    sellStock: (quantity: number) => {
        let success = false;
        set((state: SimulationState) => {
            const { activeSymbol, balance, currentIndex, marketData, portfolios } = state;
            if (!activeSymbol) return state;

            const currentData = marketData[activeSymbol]?.[currentIndex];
            const portfolio = portfolios[activeSymbol];

            if (!currentData || !portfolio || portfolio.ownedQuantity < quantity) return state;

            const revenue = currentData.price * quantity;

            const newTrade: Transaction = {
                type: 'sell',
                date: currentData.date,
                price: currentData.price,
                quantity
            };

            success = true;
            return {
                balance: balance + revenue,
                portfolios: {
                    ...portfolios,
                    [activeSymbol]: {
                        ...portfolio,
                        ownedQuantity: portfolio.ownedQuantity - quantity,
                        averageBuyPrice: portfolio.ownedQuantity - quantity === 0 ? 0 : portfolio.averageBuyPrice
                    }
                },
                tradeHistory: {
                    ...state.tradeHistory,
                    [activeSymbol]: [...(state.tradeHistory[activeSymbol] || []), newTrade]
                }
            };
        });
        return success;
    },
}));
