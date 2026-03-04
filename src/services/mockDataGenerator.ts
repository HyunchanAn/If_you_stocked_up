import { addDays, format } from 'date-fns';

export interface MarketData {
    date: string;
    price: number;
    kospi: number;
    kosdaq: number;
    bitcoin: number;
    gold: number;
    isOpen: boolean; // 주말이나 공휴일 처리용 (여기선 주말 닫힘으로 처리)
}

function getRandomDelta(current: number, volatility: number) {
    const changePercent = (Math.random() - 0.5) * volatility;
    return current * (1 + changePercent);
}

export function generateMockData(startDate: Date, endDate: Date): MarketData[] {
    const data: MarketData[] = [];
    let currentPrice = 50000;
    let currentKospi = 2500;
    let currentKosdaq = 850;
    let currentBitcoin = 80000000;
    let currentGold = 100000;

    let currentDate = startDate;

    while (currentDate <= endDate) {
        const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

        if (!isWeekend) {
            currentPrice = getRandomDelta(currentPrice, 0.05); // 5% 변동성
            currentKospi = getRandomDelta(currentKospi, 0.02);
            currentKosdaq = getRandomDelta(currentKosdaq, 0.03);
            currentBitcoin = getRandomDelta(currentBitcoin, 0.08); // 높은 변동성
            currentGold = getRandomDelta(currentGold, 0.01); // 낮은 변동성
        }

        data.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            price: isWeekend ? currentPrice : Math.round(currentPrice),
            kospi: isWeekend ? currentKospi : Number(currentKospi.toFixed(2)),
            kosdaq: isWeekend ? currentKosdaq : Number(currentKosdaq.toFixed(2)),
            bitcoin: isWeekend ? currentBitcoin : Math.round(currentBitcoin),
            gold: isWeekend ? currentGold : Math.round(currentGold),
            isOpen: !isWeekend,
        });

        currentDate = addDays(currentDate, 1);
    }

    return data;
}
