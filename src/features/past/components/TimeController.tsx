import { useEffect, useRef, useState } from 'react';
import { useSimulationStore } from '../../../store/useSimulationStore';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Play, Pause, FastForward, Clock, Settings2 } from 'lucide-react';

const PRESETS = [
    { label: '1일', interval: 1000 },
    { label: '반나절', interval: 2000 },
    { label: '1시간', interval: 24000 },
    { label: '1분', interval: 1440000 },
    { label: '1초', interval: 86400000 },
];

export function TimeController() {
    const {
        status,
        speedInterval,
        currentIndex,
        marketData,
        symbols,
        startSimulation,
        pauseSimulation,
        setSpeedInterval,
        nextDay
    } = useSimulationStore();

    const timerRef = useRef<number | null>(null);
    const anySymbol = symbols[0];
    const currentData = anySymbol ? marketData[anySymbol]?.[currentIndex] : null;

    const [autoPause, setAutoPause] = useState(false);

    // Custom UI states
    const [customValue, setCustomValue] = useState('');
    const [customUnit, setCustomUnit] = useState<'day' | 'half' | 'hour' | 'min' | 'sec'>('hour');

    useEffect(() => {
        // 커스텀 입력값이 유효하면 우선 적용
        const val = parseFloat(customValue);
        if (!isNaN(val) && val > 0) {
            let mult = 1;
            if (customUnit === 'day') mult = 1000;
            if (customUnit === 'half') mult = 2000;
            if (customUnit === 'hour') mult = 24000;
            if (customUnit === 'min') mult = 1440000;
            if (customUnit === 'sec') mult = 86400000;
            setSpeedInterval(mult / val);
        } else if (customValue === '') {
            // 값이 없으면 프리셋 기준 (기본 1일=1초)
            if (!PRESETS.find(p => p.interval === speedInterval)) {
                setSpeedInterval(1000);
            }
        }
    }, [customValue, customUnit, setSpeedInterval, speedInterval]);

    useEffect(() => {
        if (status === 'running') {
            timerRef.current = window.setInterval(() => {
                if (!currentData?.isOpen && currentData?.date) {
                    // 장 마감 (주말 등)인 경우 일시정지
                    pauseSimulation();
                } else {
                    nextDay();
                    if (autoPause) {
                        pauseSimulation();
                    }
                }
            }, Math.max(speedInterval, 10)); // 최소 10ms
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, speedInterval, nextDay, pauseSimulation, currentData, autoPause]);

    const handleStartPause = () => {
        if (status === 'running') pauseSimulation();
        else if (status === 'idle' || status === 'paused') startSimulation();
    };

    const handleNextDayManually = () => {
        nextDay();
        startSimulation(); // 다음 날 장 열기
    };

    if (!currentData) return null;

    return (
        <Card className="w-full">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <Clock size={20} className="text-blue-500" />
                        {currentData.date}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={autoPause}
                                onChange={(e) => setAutoPause(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            매일 자동 일시정지
                        </label>
                        {!currentData.isOpen ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded text-xs font-bold">
                                장 마감 (주말/휴일)
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded text-xs font-bold animate-pulse">
                                시장 열림
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                        <Settings2 size={12} />
                        시뮬레이션 속도 조절
                    </span>
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            {PRESETS.map(preset => {
                                const isActive = customValue === '' && speedInterval === preset.interval;
                                return (
                                    <button
                                        key={preset.label}
                                        onClick={() => {
                                            setCustomValue('');
                                            setSpeedInterval(preset.interval);
                                        }}
                                        className={`px-3 py-1.5 rounded text-sm font-bold transition-all ${isActive
                                                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        {preset.label}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="text-sm font-medium text-gray-400">을(를) 1초로</div>

                        <div className="flex items-center gap-2 ml-4 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                            <Input
                                type="number"
                                placeholder="숫자"
                                value={customValue}
                                onChange={(e) => setCustomValue(e.target.value)}
                                className="w-20 h-8 text-sm text-center font-bold"
                            />
                            <select
                                value={customUnit}
                                onChange={(e) => setCustomUnit(e.target.value as any)}
                                className="h-8 text-sm bg-transparent font-medium border-none focus:ring-0 text-gray-700 dark:text-gray-300 cursor-pointer"
                            >
                                <option value="day">일</option>
                                <option value="half">반나절</option>
                                <option value="hour">시간</option>
                                <option value="min">분</option>
                                <option value="sec">초</option>
                            </select>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 pr-2">을(를) 1초로</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    {!currentData.isOpen && status === 'paused' ? (
                        <Button variant="primary" onClick={handleNextDayManually} className="w-full lg:w-auto font-bold flex items-center justify-center gap-2 whitespace-nowrap">
                            <FastForward size={16} />
                            하루 시작 (다음 장 열기)
                        </Button>
                    ) : (
                        <Button
                            variant={status === 'running' ? 'secondary' : 'primary'}
                            onClick={handleStartPause}
                            disabled={status === 'finished'}
                            className="w-full lg:w-32 flex items-center justify-center gap-2 font-bold transition-all"
                        >
                            {status === 'running' ? (
                                <>
                                    <Pause size={18} className="animate-pulse text-blue-600" />
                                    일시정지
                                </>
                            ) : (
                                <>
                                    <Play size={18} />
                                    시뮬레이션 재생
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
