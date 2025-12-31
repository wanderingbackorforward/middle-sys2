import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { label: '安全大屏', path: '/dashboard' },
    { label: '人员管理', path: '/personnel' },
    { label: '安全管理', path: '/safety' },
    { label: '视频监控', path: '/video' },
    { label: '进度管理', path: '/progress' },
    { label: '数字盾构', path: '/digital-shield' },
    { label: '灌浆系统', path: '/grouting' },
  ];
  


  return (
    <div className="w-full h-24 bg-gradient-to-b from-blue-950 to-transparent border-b border-blue-900/50 flex flex-col relative shrink-0">
        <div className="flex justify-between items-center px-6 pt-2">
            <div className="text-tech-blue font-mono text-xl">
                {time.toLocaleTimeString()} <span className="text-sm text-gray-400 ml-2">{time.toLocaleDateString()}</span>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 top-1 text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 tracking-[0.2em] tech-text-glow filter drop-shadow-lg">
                    盾构隧道数据智能管控平台
                </h1>
                <p className="text-[10px] text-cyan-500 tracking-[0.5em] mt-1 uppercase">Data Intelligent Management Platform</p>
            </div>
            <div className="text-right flex items-center gap-3">
                <span className="text-green-400 text-sm">● SYNC: ONLINE</span>
                {location.pathname === '/dashboard' && (
                  <button
                    onClick={() => navigate('/landing')}
                    className="px-3 py-1 text-xs font-bold text-cyan-300 border border-cyan-500/60 rounded hover:bg-cyan-600/30 hover:text-white transition-colors"
                  >
                    返回地图
                  </button>
                )}
            </div>
        </div>
        
        <div className="flex justify-center gap-4 mt-auto mb-0">
            {menuItems.map((item) => (
                <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative px-8 py-2 text-sm font-bold transition-all duration-300 
                        ${location.pathname === item.path 
                            ? 'text-white' 
                            : 'text-blue-300 hover:text-white'
                        }`}
                >
                    {/* Trapezoid background */}
                    <div className={`absolute inset-0 transform perspective-100 border-t border-r border-l border-blue-500/50
                        ${location.pathname === item.path 
                            ? 'bg-blue-600/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]' 
                            : 'bg-blue-900/20 hover:bg-blue-800/30'
                        }`}
                         style={{ clipPath: 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' }}
                    ></div>
                    <span className="relative z-10">{item.label}</span>
                </button>
            ))}
        </div>
    </div>
  );
};

export default Header;
