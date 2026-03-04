import { useEffect, useRef } from 'react';
import { useSimulationStore } from '../../../store/useSimulationStore';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Play, Pause, FastForward, Clock } from 'lucide-react';

const SPEEDS = [1, 2, 4, 8, 16, 32, 64];

export function TimeController() {
    const {
        status,
        speedMultiplier,
        currentIndex,
        marketData,
        startSimulation,
        pauseSimulation,
        setSpeed,
        nextDay
    } = useSimulationStore();

    const timerRef = useRef<number | null>(null);
    const currentData = marketData[currentIndex];

    useEffect(() => {
        if (status === 'running') {
            // 1x = 1초 1일, 64x = 1/64초 1일 ...
            const interval = 1000 / speedMultiplier;

            timerRef.current = window.setInterval(() => {
                if (!currentData?.isOpen && currentData?.date) {
                    // 장 마감 (주말 등)인 경우 일시정지
                    pauseSimulation();
                } else {
                    nextDay();
                }
            }, interval);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, speedMultiplier, nextDay, pauseSimulation, currentData]);

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
                    <div className="flex items-center gap-2">
                        {!currentData.isOpen ? (
                            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded text-xs font-bold">
                                장 마감 (주말/휴일)
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded text-xs font-bold animate-pulse">
                                시장 열림
                            </span>
                        )}
                        <span className="text-sm font-medium text-gray-500">배속: {speedMultiplier}x</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                    {SPEEDS.map(speed => (
                        <button
                            key={speed}
                            onClick={() => setSpeed(speed)}
                            className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold transition-colors ${speedMultiplier === speed
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {speed}x
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {!currentData.isOpen && status === 'paused' ? (
                        <Button variant="primary" onClick={handleNextDayManually} className="font-bold flex items-center gap-2 whitespace-nowrap">
                            <FastForward size={16} />
                            하루 시작 (다음 장 열기)
                        </Button>
                    ) : (
                        <Button
                            variant={status === 'running' ? 'secondary' : 'primary'}
                            onClick={handleStartPause}
                            disabled={status === 'finished'}
                            className="w-32 flex items-center justify-center gap-2 font-bold"
                        >
                            {status === 'running' ? (
                                <>
                                    <Pause size={18} />
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
