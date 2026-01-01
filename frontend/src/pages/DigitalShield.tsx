import React, { useState, useEffect } from 'react';
import GuidanceMonitor from './digital-shield/GuidanceMonitor';
import GroutingSystem from './digital-shield/GroutingSystem';

const DigitalShield: React.FC = () => {
    const [currentRing, setCurrentRing] = useState(4213);
    const totalRings = 5840;
    const progress = Math.round((currentRing / totalRings) * 100);

    // Mock time update
    const [timeStr, setTimeStr] = useState(new Date().toLocaleString());
    useEffect(() => {
        const t = setInterval(() => setTimeStr(new Date().toLocaleString()), 1000);
        // Mock ring increment
        const r = setInterval(() => setCurrentRing(p => p < totalRings ? p + 1 : p), 10000);
        return () => { clearInterval(t); clearInterval(r); };
    }, []);

    return (
        <div className="flex flex-col h-full gap-4 p-2 relative">
            {/* Top Status Bar Overlay (Mocking the image header style if not using global header) 
          Since we have a global header, we can put specific stats below it or reuse it.
          The image shows a specific sub-header. Let's add a sub-bar.
      */}
            <div className="flex items-center justify-between bg-[#0f172a]/80 border border-blue-900/50 p-2 rounded px-6">
                <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">当前时间:</span>
                        <span className="text-cyan-300 font-mono">{timeStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">当前环号:</span>
                        <span className="text-white font-bold text-lg">{currentRing}</span>
                        <span className="text-gray-500">/ {totalRings}环</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-green-400 font-bold border border-green-500/50 px-2 py-0.5 rounded bg-green-900/20 animate-pulse">掘进中</span>
                        </div>
                        <div className="flex items-center gap-2 w-48">
                            <span className="text-gray-400 text-xs">进度 {progress}%</span>
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 w-[72%] shadow-[0_0_10px_#06b6d4]"></div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-green-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>在线</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                    {/* Left: Guidance Monitor (Radar) */}
                    <div className="col-span-8 h-full min-h-0">
                        <GuidanceMonitor />
                    </div>

                    {/* Right: Charts */}
                    <div className="col-span-4 h-full min-h-0">
                        <GroutingSystem />
                    </div>
                </div>
            </div>
            );
};

            export default DigitalShield;
