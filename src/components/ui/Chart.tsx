import {
    ComposedChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Scatter,
    Legend,
} from 'recharts';

interface SimpleLineChartProps {
    data: any[];
    xKey: string;
    yKey: string;
    color?: string;
    height?: number;
}

export function SimpleLineChart({
    data,
    xKey,
    yKey,
    color = '#2563eb', // blue-600
    height = 300,
}: SimpleLineChartProps) {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                        dataKey={xKey}
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => value.toLocaleString()}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#f8fafc' }}
                    />
                    <Line
                        type="monotone"
                        dataKey={yKey}
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

interface CandlestickChartProps {
    data: any[];
    xKey: string;
    height?: number;
    showKospi?: boolean;
    showKosdaq?: boolean;
    showBitcoin?: boolean;
    showGold?: boolean;
}

const CandleBody = (props: any) => {
    const { x, y, width, height, payload } = props;
    const isUp = payload.price >= payload.open;
    const fill = isUp ? '#ef4444' : '#3b82f6'; // Red for up, Blue for down

    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={Math.max(height, 1)} // 최소 1px 높이 보장
            fill={fill}
            stroke={fill}
        />
    );
};

const CandleWick = (props: any) => {
    const { x, y, width, height, payload } = props;
    const isUp = payload.price >= payload.open;
    const fill = isUp ? '#ef4444' : '#3b82f6'; // Red for up, Blue for down

    // 심지는 가운데 정렬 (얇은 선)
    const wickWidth = 2;
    const wickX = x + width / 2 - wickWidth / 2;

    return (
        <rect
            x={wickX}
            y={y}
            width={wickWidth}
            height={Math.max(height, 1)}
            fill={fill}
        />
    );
};

const TradeMarker = (props: any) => {
    const { cx, cy, payload, type } = props;

    // type이 'buy'면 캔들 아래에 표시, 'sell'이면 캔들 위에 표시 (cy는 이미 데이터 price 위치)
    // 가격 텍스트도 함께 표시
    const color = type === 'buy' ? '#ef4444' : '#3b82f6';
    const yOffset = type === 'buy' ? 15 : -15; // 삼각형 오프셋
    const textOffset = type === 'buy' ? 30 : -25; // 텍스트 오프셋

    const price = type === 'buy' ? payload.buyPrice : payload.sellPrice;
    if (!price) return null;

    return (
        <g>
            {/* 삼각형 마커 */}
            <polygon
                points={type === 'buy'
                    ? `${cx},${cy + yOffset - 5} ${cx - 5},${cy + yOffset + 5} ${cx + 5},${cy + yOffset + 5}`
                    : `${cx},${cy + yOffset + 5} ${cx - 5},${cy + yOffset - 5} ${cx + 5},${cy + yOffset - 5}`
                }
                fill={color}
            />
            {/* 가격 텍스트 */}
            <text
                x={cx}
                y={cy + textOffset}
                textAnchor="middle"
                fill={color}
                fontSize="11"
                fontWeight="bold"
            >
                {type === 'buy' ? 'B' : 'S'} {price.toLocaleString()}
            </text>
        </g>
    );
};

export function CandlestickChart({
    data,
    xKey,
    height = 300,
    showKospi = false,
    showKosdaq = false,
    showBitcoin = false,
    showGold = false,
}: CandlestickChartProps) {
    const hasSecondaryLines = showKospi || showKosdaq || showBitcoin || showGold;

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <ComposedChart data={data} margin={{ top: 5, right: hasSecondaryLines ? 10 : 30, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis
                        dataKey={xKey}
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#9ca3af"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value: number) => value.toLocaleString()}
                        domain={['auto', 'auto']}
                    />
                    {hasSecondaryLines && (
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#9ca3af"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            domain={['auto', 'auto']}
                        />
                    )}
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#f8fafc'
                        }}
                        itemStyle={{ color: '#f8fafc' }}
                        labelStyle={{ color: '#9ca3af', marginBottom: '8px' }}
                        formatter={(value: any, name?: string) => {
                            if (name === 'wick') return [value.toLocaleString ? value.toLocaleString() : value, '고가/저가'];
                            if (name === 'body') return ['...', '시가/종가']; // skip showing internal rect bounds
                            if (['buy', 'sell'].includes(name as string)) return [value.toLocaleString(), typeToLabel(name)];
                            return [value.toLocaleString ? value.toLocaleString() : value, name];
                        }}
                    />
                    {hasSecondaryLines && <Legend verticalAlign="top" height={36} />}
                    {/* 심지 (고가-저가) */}
                    <Bar
                        yAxisId="left"
                        name="wick"
                        dataKey={(d: any) => [d.low, d.high]}
                        shape={<CandleWick />}
                        isAnimationActive={false}
                    />
                    {/* 몸통 (시가-종가) */}
                    <Bar
                        yAxisId="left"
                        name="body"
                        dataKey={(d: any) => [Math.min(d.open, d.price), Math.max(d.open, d.price)]}
                        shape={<CandleBody />}
                        isAnimationActive={false}
                    />

                    {/* 매수/매도 마커 */}
                    <Scatter
                        yAxisId="left"
                        name="buy"
                        dataKey="buyPrice"
                        shape={<TradeMarker type="buy" />}
                        isAnimationActive={false}
                    />
                    <Scatter
                        yAxisId="left"
                        name="sell"
                        dataKey="sellPrice"
                        shape={<TradeMarker type="sell" />}
                        isAnimationActive={false}
                    />

                    {/* 비교 라인들 */}
                    {showKospi && <Line yAxisId="right" type="monotone" dataKey="kospi" name="KOSPI" stroke="#8b5cf6" dot={false} strokeWidth={2} />}
                    {showKosdaq && <Line yAxisId="right" type="monotone" dataKey="kosdaq" name="KOSDAQ" stroke="#ec4899" dot={false} strokeWidth={2} />}
                    {showBitcoin && <Line yAxisId="right" type="monotone" dataKey="bitcoin" name="비트코인(BTC)" stroke="#f59e0b" dot={false} strokeWidth={2} />}
                    {showGold && <Line yAxisId="right" type="monotone" dataKey="gold" name="금(Gold)" stroke="#eab308" dot={false} strokeWidth={2} />}

                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}

function typeToLabel(type: string | undefined): string {
    if (type === 'buy') return '매수 단가';
    if (type === 'sell') return '매도 단가';
    return type || '';
}
