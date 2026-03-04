import { format } from 'date-fns';

export interface MarketData {
    date: string;
    price: number; // close price
    open: number;
    high: number;
    low: number;
    kospi: number;
    kosdaq: number;
    bitcoin: number;
    gold: number;
    isOpen: boolean;
}

const SYMBOLS = {
    KOSPI: '^KS11',
    KOSDAQ: '^KQ11',
    BITCOIN: 'BTC-KRW',
    GOLD: 'GC=F' // USD
};

async function fetchYahooFinance(symbol: string, period1: number, period2: number, interval: string = '1d') {
    const url = `/api/finance/v8/finance/chart/${encodeURIComponent(symbol)}?period1=${period1}&period2=${period2}&interval=${interval}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch data for ${symbol}`);
    const data = await res.json();
    return data.chart.result?.[0];
}

export async function fetchHistoricalData(mainSymbol: string, startDate: Date, endDate: Date): Promise<MarketData[]> {
    const period1 = Math.floor(startDate.getTime() / 1000);
    const period2 = Math.floor(endDate.getTime() / 1000) + 86400; // include end date

    // Fetch all symbols concurrently
    const [mainRes, kospiRes, kosdaqRes, btcRes, goldRes] = await Promise.all([
        fetchYahooFinance(mainSymbol, period1, period2, '1d').catch(() => null),
        fetchYahooFinance(SYMBOLS.KOSPI, period1, period2, '1d').catch(() => null),
        fetchYahooFinance(SYMBOLS.KOSDAQ, period1, period2, '1d').catch(() => null),
        fetchYahooFinance(SYMBOLS.BITCOIN, period1, period2, '1d').catch(() => null),
        fetchYahooFinance(SYMBOLS.GOLD, period1, period2, '1d').catch(() => null),
    ]);

    if (!mainRes || !mainRes.timestamp) {
        throw new Error('Failed to fetch main stock data. Please check the symbol.');
    }

    const timestamps: number[] = mainRes.timestamp;
    const mainQuotes = mainRes.indicators.quote[0];
    const mainPrices: number[] = mainQuotes.close;
    const mainOpens: number[] = mainQuotes.open;
    const mainHighs: number[] = mainQuotes.high;
    const mainLows: number[] = mainQuotes.low;

    const mapData = (res: any) => {
        const map = new Map<string, number>();
        if (!res || !res.timestamp) return map;
        const ts: number[] = res.timestamp;
        const closes: number[] = res.indicators.quote[0].close;
        for (let i = 0; i < ts.length; i++) {
            const dateStr = format(new Date(ts[i] * 1000), 'yyyy-MM-dd');
            if (closes[i] !== null && closes[i] !== undefined) {
                map.set(dateStr, closes[i]);
            }
        }
        return map;
    };

    const kospiMap = mapData(kospiRes);
    const kosdaqMap = mapData(kosdaqRes);
    const btcMap = mapData(btcRes);
    const goldMap = mapData(goldRes);

    const marketData: MarketData[] = [];
    let lastKospi = 2500, lastKosdaq = 850, lastBtc = 80000000, lastGold = 2000;

    for (let i = 0; i < timestamps.length; i++) {
        if (mainPrices[i] === null || mainPrices[i] === undefined) continue;

        const dateObj = new Date(timestamps[i] * 1000);
        const dateStr = format(dateObj, 'yyyy-MM-dd');

        lastKospi = kospiMap.get(dateStr) || lastKospi;
        lastKosdaq = kosdaqMap.get(dateStr) || lastKosdaq;
        lastBtc = btcMap.get(dateStr) || lastBtc;
        lastGold = goldMap.get(dateStr) || lastGold;

        marketData.push({
            date: dateStr,
            price: Math.round(mainPrices[i]),
            open: Math.round(mainOpens[i]),
            high: Math.round(mainHighs[i]),
            low: Math.round(mainLows[i]),
            kospi: Number(lastKospi.toFixed(2)),
            kosdaq: Number(lastKosdaq.toFixed(2)),
            bitcoin: Math.round(lastBtc),
            gold: Math.round(lastGold),
            isOpen: true,
        });
    }

    return marketData;
}

export async function fetchCurrentData(symbol: string) {
    // Fetch 1-day range with 1-minute interval for live data
    const url = `/api/finance/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=1m`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch live data');
    const data = await res.json();
    const result = data.chart.result?.[0];

    if (!result || !result.timestamp) return null;

    const ts: number[] = result.timestamp;
    const closes: number[] = result.indicators.quote[0].close;

    const dataPoints = [];
    for (let i = 0; i < ts.length; i++) {
        if (closes[i] !== null && closes[i] !== undefined) {
            dataPoints.push({
                time: format(new Date(ts[i] * 1000), 'HH:mm:ss'),
                price: Math.round(closes[i])
            });
        }
    }

    return dataPoints;
}

export async function fetchPreSimulationData(mainSymbol: string, endDate: Date): Promise<MarketData[]> {
    // period1=0 fetches maximum available history
    const period1 = 0;
    const period2 = Math.floor(endDate.getTime() / 1000); // Exclude the actual start date itself

    const mainRes = await fetchYahooFinance(mainSymbol, period1, period2, '1d').catch(() => null);

    if (!mainRes || !mainRes.timestamp) {
        return [];
    }

    const timestamps: number[] = mainRes.timestamp;
    const mainQuotes = mainRes.indicators.quote[0];
    const mainPrices: number[] = mainQuotes.close;
    const mainOpens: number[] = mainQuotes.open;
    const mainHighs: number[] = mainQuotes.high;
    const mainLows: number[] = mainQuotes.low;

    const marketData: MarketData[] = [];

    for (let i = 0; i < timestamps.length; i++) {
        if (mainPrices[i] === null || mainPrices[i] === undefined) continue;

        const dateObj = new Date(timestamps[i] * 1000);
        const dateStr = format(dateObj, 'yyyy-MM-dd');

        // For pre-simulation data we don't strictly need precise indices, 
        // passing 0 is fine since it's just for the main chart's background context
        marketData.push({
            date: dateStr,
            price: Math.round(mainPrices[i]),
            open: Math.round(mainOpens[i] || mainPrices[i]),
            high: Math.round(mainHighs[i] || mainPrices[i]),
            low: Math.round(mainLows[i] || mainPrices[i]),
            kospi: 0,
            kosdaq: 0,
            bitcoin: 0,
            gold: 0,
            isOpen: true,
        });
    }

    return marketData;
}
