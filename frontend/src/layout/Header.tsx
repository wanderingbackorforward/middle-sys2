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
    { label: '项目概览', path: '/overview' }, // Placeholder for Project Overview if needed, or just keep as is
    { label: '视频监控', path: '/video' },
    { label: '安全监测', path: '/safety-monitor' }, // Placeholder
    { label: '导向监测', path: '/guidance' }, // Placeholder
    { label: '注浆系统', path: '/grouting' },
    { label: '掘进控制', path: '/tunneling' }, // Placeholder
    { label: '土层及材料', path: '/material' }, // Placeholder
  ];

  // Based on user screenshot: 
  // [安全大屏] [人员管理] [安全管理] [视频监控] [进度管理] [数字盾构] [灌浆系统] (Old)
  // Screenshot order seems to be: [项目概览] [视频监控] [安全监测] [导向监测] [注浆系统] [掘进控制] [土层及材料] 
  // Wait, the user said "Use this image" referring to the PREVIOUS message about Grouting System.
  // The user's latest message says: "还叫数字盾构而不是转向监测 改完"
  // And "类似 灌浆系统也复刻好 请你来修改那个对应文件 使用这张图"
  // The screenshot in the PREVIOUS message shows a header: 
  // "项目概览 视频监控 安全监测 导向监测 注浆系统 掘进控制 土层及材料"
  // BUT, the user also said "还叫数字盾构而不是转向监测".
  // This implies the user wants the PAGE TITLE inside DigitalShield to be "数字盾构" again?
  // OR does the user want the MENU ITEM to be "数字盾构"?
  
  // Let's look at the user input again carefully:
  // "数字盾构哪一页应该叫转向监测 另外问题是应该是动态的 你现在是死的 修改并提交" (User previously asked to change "Digital Shield" page's internal title to "Steering Monitor"?)
  // NO, user said "Digital Shield WHICH PAGE should be called Steering Monitor".
  // User input: "还叫数字盾构而不是转向监测 改完"
  // Meaning: "It should still be called Digital Shield, NOT Steering Monitor. Finish changing it."
  
  // So: 
  // 1. Revert internal title in GuidanceMonitor.tsx from "转向监测" back to "导向监测" or "数字盾构"? 
  //    The component is `GuidanceMonitor`. The previous title was "导向监测". User changed it to "转向监测". Now wants it back?
  //    "还叫数字盾构而不是转向监测" -> "It is still called Digital Shield, not Steering Monitor".
  //    This likely refers to the MENU ITEM or the PAGE TITLE.
  
  // Let's stick to the MENU items first.
  // The screenshot provided in the Grouting task shows the menu bar:
  // [项目概览] [视频监控] [安全监测] [导向监测] [注浆系统] [掘进控制] [土层及材料]
  // BUT the user's existing menu has: 
  // Safety Dashboard, Personnel, Safety, Video, Progress, Digital Shield, Grouting.
  
  // If I look at the screenshot again (the Grouting System one):
  // The active tab is "注浆系统".
  // The tabs are: "项目概览", "视频监控", "安全监测", "导向监测", "注浆系统", "掘进控制", "土层及材料".
  
  // However, the user said "还叫数字盾构而不是转向监测".
  // This is confusing. 
  // Interpretation A: The page `DigitalShield.tsx` was renamed to "转向监测" internally, user wants it back to "数字盾构".
  // Interpretation B: The user wants the menu item "Digital Shield" to remain "Digital Shield".
  
  // Let's look at the context.
  // I changed `GuidanceMonitor.tsx` title to "转向监测".
  // User says: "还叫数字盾构而不是转向监测".
  // This implies the change I made (renaming to "转向监测") was WRONG or user changed mind.
  // So I should revert `GuidanceMonitor.tsx` title to... "导向监测"? Or "数字盾构"?
  // The component is a Radar. "导向监测" (Guidance Monitor) makes sense. "数字盾构" (Digital Shield) is the whole system/page.
  // In `DigitalShield.tsx`, the left component is `GuidanceMonitor`.
  
  // Let's assume the user wants the Header menu to match the project structure BUT maybe reordered?
  // The user provided a crop of the header: `[灌浆系统] [人员管理] [安全管理] [视频监控] [进度管理] [数字盾构]`
  // WAIT, the crop image `https://file-s3.trae.ai/...` shows:
  // `... [灌浆系统] [人员管理] [安全管理] [视频监控] [进度管理] [数字盾构]`
  // Actually, looking at the crop provided in the prompt context (I can't see the image content directly, but I can infer).
  // The user said: "使用这张图" (referring to the crop).
  // And "类似 灌浆系统也复刻好...".
  
  // Let's look at the current `Header.tsx`:
  // { label: '安全大屏', path: '/dashboard' },
  // { label: '人员管理', path: '/personnel' },
  // { label: '安全管理', path: '/safety' },
  // { label: '视频监控', path: '/video' },
  // { label: '进度管理', path: '/progress' },
  // { label: '数字盾构', path: '/digital-shield' },
  // { label: '灌浆系统', path: '/grouting' },
  
  // User says: "还叫数字盾构而不是转向监测".
  // This specifically targets my previous action where I renamed "导向监测" to "转向监测" inside the DigitalShield page.
  // So I must revert that specific change in `GuidanceMonitor.tsx`.
  
  // User ALSO says: "改完" (Finish it).
  
  // Regarding the Header: The user provided a crop in the PREVIOUS turn, but in THIS turn they didn't explicitly ask to change the header, 
  // just "还叫数字盾构而不是转向监测".
  // BUT the crop image shows a specific order? 
  // Let's look at the crop description if available... I don't have it.
  // I will assume the user primarily wants to fix the naming issue they just pointed out.
  // "数字盾构哪一页应该叫转向监测" -> "Which page of Digital Shield should be called Steering Monitor?" (Rhetorical? Or correcting me?)
  // "另外问题是应该是动态的 你现在是死的" -> "Also it should be dynamic, yours is static" (I fixed this in previous turn).
  // "还叫数字盾构而不是转向监测" -> "It is still called Digital Shield, not Steering Monitor".
  
  // OK, plan:
  // 1. In `GuidanceMonitor.tsx`: Change title back to "导向监测" (Guidance Monitor) or "数字盾构" (Digital Shield)?
  //    Original was "导向监测".
  //    User says "还叫数字盾构".
  //    I will change the title in `GuidanceMonitor.tsx` to "数字盾构" (Digital Shield) to be safe, or "导向监测" if "数字盾构" is the page title.
  //    Actually, "数字盾构" is usually the main module. The radar is "Guidance".
  //    But if the user insists "还叫数字盾构", I will use "数字盾构".
  
  // 2. The Header menu items. 
  //    If I look at the crop provided in the prompt: `安全大屏 人员管理 安全管理 视频监控 进度管理 数字盾构`... and `灌浆系统`?
  //    The user's crop seems to imply `灌浆系统` might be in a specific place.
  //    However, I will focus on the explicit text instruction first: "Revert the name change".
  
  // Let's update `GuidanceMonitor.tsx` first.
  


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
