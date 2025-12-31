import React, { useState, useEffect } from 'react';

const GuidanceMonitor: React.FC = () => {
  // Mock dynamic data
  const [hDev, setHDev] = useState(2.4);
  const [vDev, setVDev] = useState(3.1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
        // Random fluctuation
        setHDev(prev => Number((prev + (Math.random() - 0.5) * 0.1).toFixed(2)));
        setVDev(prev => Number((prev + (Math.random() - 0.5) * 0.1).toFixed(2)));
        // Position jitter (within small range)
        setPosX(prev => {
            const next = prev + (Math.random() - 0.5) * 2;
            return Math.max(-20, Math.min(20, next));
        });
        setPosY(prev => {
            const next = prev + (Math.random() - 0.5) * 2;
            return Math.max(-20, Math.min(20, next));
        });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Radar Section */}
      <div className="flex-[2] tech-card relative overflow-hidden flex flex-col">
        <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2 tracking-wider">转向监测</h3>
        
        {/* Radar Container */}
        <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-[#0b1525] to-[#050a15]">
            {/* Grid/Target Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                {/* Crosshair */}
                <div className="w-full h-[1px] bg-cyan-500 absolute"></div>
                <div className="h-full w-[1px] bg-cyan-500 absolute"></div>
                {/* Diagonals */}
                <div className="w-[150%] h-[1px] bg-blue-800 absolute rotate-45"></div>
                <div className="w-[150%] h-[1px] bg-blue-800 absolute -rotate-45"></div>
            </div>

            {/* Target Rings */}
            <div className="relative w-[400px] h-[400px] flex items-center justify-center">
                {/* Outer Ring (Red) */}
                <div className="absolute w-full h-full rounded-full border border-red-600/60 shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-pulse"></div>
                {/* Mid Ring (Yellow) */}
                <div className="absolute w-[70%] h-[70%] rounded-full border border-yellow-500/60"></div>
                <div className="absolute top-[15%] right-[15%] text-yellow-500 text-xs">50mm</div>
                {/* Inner Ring (Green) */}
                <div className="absolute w-[40%] h-[40%] rounded-full border border-green-500/60"></div>
                <div className="absolute top-[30%] right-[30%] text-green-500 text-xs">20mm</div>
                
                {/* Center Star/Shield Position */}
                <div 
                    className="relative z-10 w-12 h-12 transition-all duration-1000 ease-in-out"
                    style={{ transform: `translate(${posX}px, ${posY}px)` }}
                >
                    {/* A simple SVG shape for the shield center */}
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_#06b6d4]">
                        <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="#06b6d4" />
                    </svg>
                </div>
            </div>

            {/* Direction Arrows & Values */}
            {/* Top Right Arrow */}
            <div className="absolute top-10 right-10 flex flex-col items-center gap-1">
                <span className="text-cyan-400 font-bold text-xl">{hDev} mm/m</span>
                <div className="w-1 h-16 bg-gradient-to-t from-transparent to-cyan-500 relative">
                    <div className="absolute -top-1 -left-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-500 rotate-45"></div>
                </div>
            </div>

            {/* Bottom Right Arrow */}
            <div className="absolute bottom-10 right-10 flex flex-row items-center gap-1">
                <div className="h-1 w-24 bg-gradient-to-r from-transparent to-cyan-500 relative">
                    <div className="absolute -right-1 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-500 rotate-45"></div>
                </div>
                <span className="text-cyan-400 font-bold text-xl">{vDev} mm/m</span>
            </div>

            {/* Left Expand Button (Mock) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-blue-900/50 p-2 rounded-r cursor-pointer hover:bg-blue-800">
                <span className="text-cyan-400 text-2xl">‹</span>
            </div>
        </div>
      </div>

      {/* Bottom Alarm Info */}
      <div className="h-32 tech-card flex flex-col">
         <h3 className="text-lg font-bold text-tech-blue mb-2 border-l-4 border-tech-blue pl-2 tracking-wider">报警信息</h3>
         <div className="flex-1 flex items-center justify-center text-gray-500 bg-black/20 rounded border border-dashed border-gray-700">
             暂无报警数据
         </div>
      </div>
    </div>
  );
};

export default GuidanceMonitor;
