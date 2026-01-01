import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Shield,
  AlertTriangle,
  Wind,
  Anchor,
  Eye,
  Cpu,
  Bot,
  MessageSquare,
  X,
  Send,
  Loader2,
  Terminal,
  GitBranch,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
// import { connectSSE } from '../utils/sse'; // SSE 已移除，改用轮询
import { apiUrl } from '../utils/api';
import ReactMarkdown from 'react-markdown';

const callGemini = async (prompt: string, systemInstruction = ''): Promise<string> => {
  try {
    console.log('[ai] request backend', apiUrl(`/api/ai/deepseek`));
    const resp = await fetch(apiUrl(`/api/ai/deepseek`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction })
    });
    if (resp.ok) {
      const data = await resp.json().catch(() => null);
      console.log('[ai] backend resp ok json=', data);
      const t = data?.text;
      if (t && typeof t === 'string') return t;
    }
    console.warn('[ai] backend resp not ok status=', resp.status);
  } catch { }
  const key = (import.meta as any).env?.VITE_PUBLIC_DEEPSEEK_KEY;
  if (!key) return '连接大模型服务失败，请检查网络或配额。';
  try {
    console.warn('[ai] fallback direct');
    const r = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });
    if (!r.ok) throw new Error('API Call Failed');
    const data = await r.json();
    console.log('[ai] direct resp json=', data);
    const text = data?.choices?.[0]?.message?.content;
    return text || '智能体响应异常，请稍后重试。';
  } catch {
    return '连接大模型服务失败，请检查网络或配额。';
  }
};

const Card: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  action?: React.ReactNode;
  alertLevel?: 'normal' | 'warning' | 'critical';
}> = ({ title, children, className = '', icon: Icon, action, alertLevel = 'normal' }) => {
  const borderColor =
    alertLevel === 'critical'
      ? 'border-red-600/60'
      : alertLevel === 'warning'
        ? 'border-yellow-500/60'
        : 'border-blue-800/50';
  const glowColor =
    alertLevel === 'critical'
      ? 'shadow-[0_0_20px_rgba(220,38,38,0.2)]'
      : alertLevel === 'warning'
        ? 'shadow-[0_0_20px_rgba(234,179,8,0.2)]'
        : '';

  return (
    <div
      className={`bg-slate-900/80 border ${borderColor} ${glowColor} rounded-lg flex flex-col relative overflow-hidden backdrop-blur-md transition-all duration-500 ${className}`}
    >
      <div
        className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
          }`}
      ></div>
      <div
        className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
          }`}
      ></div>
      <div
        className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
          }`}
      ></div>
      <div
        className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${alertLevel === 'critical' ? 'border-red-500' : 'border-cyan-400/80'
          }`}
      ></div>

      <div
        className={`px-4 py-3 border-b ${borderColor} flex items-center justify-between bg-gradient-to-r ${alertLevel === 'critical' ? 'from-red-900/20' : 'from-blue-900/20'
          } to-transparent`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={alertLevel === 'critical' ? 'text-red-400' : 'text-cyan-400'} />}
          <h3
            className={`font-bold tracking-wider text-sm uppercase ${alertLevel === 'critical' ? 'text-red-100' : 'text-cyan-100'
              }`}
          >
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="flex-1 p-4 overflow-auto relative scrollbar-hide">{children}</div>
    </div>
  );
};

const generateSensorData = (length: number, base: number, variance: number) => {
  return Array.from({ length }, (_, i) => ({
    time: `10:${i < 10 ? '0' + i : i}`,
    value: base + Math.random() * variance - variance / 2,
    threshold: base + variance
  }));
};


const TunnelRiskAgent: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [agentState, setAgentState] = useState<'idle' | 'detecting' | 'thinking' | 'deciding' | 'executing'>('idle');
  const [agentLogs, setAgentLogs] = useState<Array<{ id: number; message: string; type: 'info' | 'warning' | 'critical' | 'success' }>>([]);
  const [decisionPlan, setDecisionPlan] = useState<Array<{ step: number; action: string; auto: boolean; reason: string }>>([]);

  const [gasData, setGasData] = useState(generateSensorData(20, 0.05, 0.02));
  const [pressureData, setPressureData] = useState(generateSensorData(20, 2.5, 0.3));

  const [activeRisk, setActiveRisk] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'agent' | 'history'>('agent');
  const [episodes, setEpisodes] = useState<Array<any>>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [workOrdersForEpisode, setWorkOrdersForEpisode] = useState<Array<any>>([]);
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [workOrderForm, setWorkOrderForm] = useState<{ assignee: string; priority: 'high' | 'medium' | 'low'; notes: string }>({ assignee: '', priority: 'medium', notes: '' });

  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    { role: 'model', text: '系统已就绪。全域传感器在线，视觉识别模组运行中。' }
  ]);
  const [isChatThinking, setIsChatThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, showChat]);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentLogs]);

  // 轮询机制替代 SSE
  useEffect(() => {
    const pollInterval = 5000; // 5秒轮询一次

    const fetchData = async () => {
      try {
        // 1. 获取传感器时序数据
        const tsResp = await fetch(apiUrl('/api/dashboard/timeseries'));
        if (tsResp.ok) {
          const data = await tsResp.json();
          const latestGas = data.gasConcentration?.[data.gasConcentration.length - 1];
          const latestPressure = data.slurryPressure?.[data.slurryPressure.length - 1];

          if (latestGas) {
            setGasData(prev => [
              ...prev.slice(1),
              { time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }), value: latestGas.value, threshold: 0.5 }
            ]);
          }
          if (latestPressure) {
            setPressureData(prev => [
              ...prev.slice(1),
              { time: new Date().toLocaleTimeString('en-US', { hour12: false, minute: '2-digit', second: '2-digit' }), value: latestPressure.value, threshold: 3.5 }
            ]);
          }
        }

        // 2. 检查智能体自动触发状态
        // 这里模拟检查，实际上后端应该有一个 /api/agent/latest 接口
        // 暂时略过自动触发的轮询，以免冲突，依赖手动触发即可
      } catch (e) {
        console.error('[Poll] fetch error', e);
      }
    };

    const timer = setInterval(fetchData, pollInterval);
    fetchData(); // 立即执行一次

    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    if (activeTab === 'history') {
      const fetchEpisodes = async () => {
        setEpisodesLoading(true);
        try {
          const resp = await fetch(apiUrl('/api/agent/episodes?limit=10'));
          const data = await resp.json();
          if (data?.success && Array.isArray(data.episodes)) {
            setEpisodes(data.episodes);
          } else {
            setEpisodes([]);
          }
        } catch {
          setEpisodes([]);
        }
        setEpisodesLoading(false);
      };
      fetchEpisodes();
    }
  }, [activeTab]);

  // 自动监测：当轮询发现数据超阈值时自动触发风险处理
  const autoTriggerRef = useRef(false); // 防止重复触发
  useEffect(() => {
    // 检查最新的瓦斯数据是否超阈值
    const latestGas = gasData[gasData.length - 1];
    if (latestGas && latestGas.value > 0.5 && !autoTriggerRef.current && agentState === 'idle') {
      autoTriggerRef.current = true;
      console.log('[AutoMonitor] 检测到瓦斯超标，自动触发风险处理', latestGas.value);
      triggerRiskScenario('gas');
    }
    // 重置触发状态（当数据恢复正常时）
    if (latestGas && latestGas.value <= 0.5 && autoTriggerRef.current) {
      setTimeout(() => { autoTriggerRef.current = false; }, 30000); // 30秒后允许再次触发
    }
  }, [gasData, agentState]);

  const addAgentLog = (message: string, type: 'info' | 'warning' | 'critical' | 'success' = 'info') => {
    setAgentLogs(prev => [...prev, { id: Date.now(), message, type }]);
  };

  const triggerRiskScenario = async (type: 'personnel' | 'gas' | 'vehicle') => {
    setSystemStatus('critical');
    setAiAnalysis(null);
    setAgentLogs([]);
    setDecisionPlan([]);
    setAgentState('detecting');

    addAgentLog(`[感知层] 正在从后端获取真实传感器数据...`, 'info');

    // ========== 从后端获取真实传感器数据 ==========
    let riskDetails: any = {};
    let sensorData: any = {};
    let detectedBy = '';
    let location = '';

    try {
      if (type === 'gas') {
        // 获取瓦斯浓度真实数据
        const resp = await fetch(apiUrl('/api/dashboard/timeseries'));
        const data = await resp.json();
        const gasArr = data.gasConcentration || [];
        const latestGas = gasArr.length > 0 ? gasArr[gasArr.length - 1] : { value: 0.1 };
        const gasValue = latestGas.value;
        const threshold = 0.5; // 瓦斯阈值 0.5%

        sensorData = {
          ch4: gasValue,
          threshold,
          trend: gasValue > threshold ? 'rising' : 'stable',
          source: 'supabase_realtime'
        };
        location = '回风管路 A1段';
        detectedBy = '多气体传感器组 G-12';
        riskDetails = {
          id: `RISK-${Date.now()}`,
          type: 'gas',
          title: gasValue > threshold ? '瓦斯浓度异常超限' : '瓦斯浓度正常监测',
          location,
          level: '',
          detectedBy,
          timestamp: new Date().toLocaleTimeString(),
          metrics: { ch4: `${(gasValue * 100).toFixed(2)}% (阈值 ${threshold * 100}%)`, trend: sensorData.trend }
        };
        addAgentLog(`[数据层] 瓦斯浓度: ${(gasValue * 100).toFixed(2)}% (来源: Supabase)`, gasValue > threshold ? 'critical' : 'info');

      } else if (type === 'personnel') {
        // 获取人员统计真实数据
        const resp = await fetch(apiUrl('/api/personnel/stats'));
        const data = await resp.json();
        const totalOnSite = data.totalOnSite || 0;
        const violations = data.violations || 0;

        sensorData = {
          totalOnSite,
          violations,
          attendanceRate: data.attendanceRate,
          source: 'supabase_realtime'
        };
        location = '管片拼装区 B2段';
        detectedBy = 'AI视觉识别相机 #04 + 人员定位系统';
        riskDetails = {
          id: `RISK-${Date.now()}`,
          type: 'personnel',
          title: violations > 0 ? '人员违规行为检测' : '人员分布监测',
          location,
          level: '',
          detectedBy,
          timestamp: new Date().toLocaleTimeString(),
          metrics: { 在场人数: `${totalOnSite}人`, 违规数: `${violations}`, 出勤率: data.attendanceRate }
        };
        addAgentLog(`[数据层] 在场人员: ${totalOnSite}人, 违规: ${violations} (来源: Supabase)`, violations > 0 ? 'warning' : 'info');

      } else if (type === 'vehicle') {
        // 获取泥浆压力作为车辆/设备监测的代理数据
        const resp = await fetch(apiUrl('/api/dashboard/timeseries'));
        const data = await resp.json();
        const slurryArr = data.slurryPressure || [];
        const latestSlurry = slurryArr.length > 0 ? slurryArr[slurryArr.length - 1] : { value: 2.0 };
        const pressureValue = latestSlurry.value;
        const threshold = 3.0; // 压力阈值

        sensorData = {
          pressure: pressureValue,
          threshold,
          status: pressureValue > threshold ? 'warning' : 'normal',
          source: 'supabase_realtime'
        };
        location = '后配套物流通道';
        detectedBy = 'UWB定位 + 压力传感器';
        riskDetails = {
          id: `RISK-${Date.now()}`,
          type: 'vehicle',
          title: pressureValue > threshold ? '设备压力异常预警' : '物流设备状态监测',
          location,
          level: '',
          detectedBy,
          timestamp: new Date().toLocaleTimeString(),
          metrics: { 压力值: `${pressureValue.toFixed(2)} bar (阈值 ${threshold})`, 状态: sensorData.status }
        };
        addAgentLog(`[数据层] 设备压力: ${pressureValue.toFixed(2)} bar (来源: Supabase)`, pressureValue > threshold ? 'warning' : 'info');
      }

    } catch (error) {
      addAgentLog(`[数据层] 获取真实数据失败，使用降级模式`, 'warning');
      // 降级：使用默认模拟值
      if (type === 'gas') {
        sensorData = { ch4: 0.92, threshold: 0.5, trend: 'rising', source: 'fallback' };
        location = '回风管路 A1段';
        detectedBy = '多气体传感器组 G-12';
      } else if (type === 'personnel') {
        sensorData = { totalOnSite: 48, violations: 2, source: 'fallback' };
        location = '管片拼装区 B2段';
        detectedBy = 'AI视觉识别相机 #04';
      } else {
        sensorData = { pressure: 3.5, threshold: 3.0, source: 'fallback' };
        location = '后配套物流通道';
        detectedBy = 'UWB定位 + 压力传感器';
      }
      riskDetails = {
        id: `RISK-${Date.now()}`,
        type,
        title: `${type === 'gas' ? '瓦斯' : type === 'personnel' ? '人员' : '设备'}风险触发`,
        location,
        level: '',
        detectedBy,
        timestamp: new Date().toLocaleTimeString(),
        metrics: sensorData
      };
    }

    setActiveRisk(riskDetails);
    addAgentLog(`[感知层] 接收到 ${riskDetails.detectedBy} 异常信号`, 'warning');

    // 调用真实智能体 API
    setAgentState('thinking');
    addAgentLog(`[智能体] 正在调用 LangGraph 工作流...`, 'info');

    try {
      const response = await fetch(apiUrl('/api/agent/analyze'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_type: type,
          sensor_data: sensorData,
          location: riskDetails.location
        })
      });

      if (!response.ok) {
        throw new Error(`API 响应错误: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '智能体分析失败');
      }

      // 更新风险等级
      riskDetails.level = result.risk_level || '未知';
      setActiveRisk({ ...riskDetails });

      // 显示真实的推理步骤
      const steps = result.reasoning_steps || [];
      for (const step of steps) {
        const logType = step.message?.includes('风险等级') ? 'critical'
          : step.message?.includes('生成') || step.message?.includes('完成') ? 'success'
            : step.message?.includes('警告') ? 'warning' : 'info';
        addAgentLog(step.message, logType as any);
      }

      // 设置智能体生成的决策方案
      setAgentState('deciding');
      const plan = result.decision_plan || [];

      // 显示 RAG 检索结果
      const docs = result.retrieved_docs || [];
      if (docs.length > 0) {
        addAgentLog(`[知识库] 检索到 ${docs.length} 条相关规范`, 'info');
      }

      setAgentState('executing');
      setDecisionPlan(plan.map((p: any, idx: number) => ({
        step: p.step || idx + 1,
        action: p.action || '',
        auto: p.auto !== false,
        reason: p.reason || ''
      })));
      addAgentLog(`[执行层] 已生成 ${plan.length} 条管控指令`, 'success');

      // 设置 AI 分析报告
      if (result.report) {
        setAiAnalysis(result.report);
      }

    } catch (error: any) {
      console.error('[Agent] Error:', error);
      addAgentLog(`[错误] ${error.message || '智能体调用失败'}`, 'critical');

      // 降级：使用旧的 AI 问答方式
      setAgentState('executing');
      addAgentLog(`[降级] 使用简化模式生成处置建议...`, 'warning');
      await generateRiskReport(riskDetails, '风险已触发，请基于当前状态生成简报');
    }
  };

  const resetSystem = () => {
    setSystemStatus('normal');
    setActiveRisk(null);
    setAiAnalysis(null);
    setAgentLogs([]);
    setDecisionPlan([]);
    setAgentState('idle');
  };

  const generateRiskReport = async (risk = activeRisk, contextOverride = '') => {
    if (!risk) return;
    setIsAnalyzing(true);
    const context = contextOverride || `
      当前系统状态：${systemStatus}
      风险事件：${risk.title}
      监测位置：${risk.location}
      关键指标：${JSON.stringify(risk.metrics)}
      
      作为盾构施工安全专家，请生成一份简短的应急处置与原因分析报告。
      格式要求：
      1. 风险成因研判
      2. 立即管控措施 (3条)
      3. 后续检查建议
    `;
    const result = await callGemini('生成风险研判报告', context);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };
  
  const openEpisodeDetail = async (id: string) => {
    setSelectedEpisode(null);
    setWorkOrdersForEpisode([]);
    try {
      const resp = await fetch(apiUrl(`/api/agent/episodes/${id}`));
      const data = await resp.json();
      if (data?.success && data.episode) {
        setSelectedEpisode(data.episode);
      }
    } catch {}
    try {
      const respWO = await fetch(apiUrl(`/api/agent/work-orders?limit=50`));
      const dataWO = await respWO.json();
      if (dataWO?.success && Array.isArray(dataWO.work_orders)) {
        const list = dataWO.work_orders.filter((w: any) => w.episode_id === id);
        setWorkOrdersForEpisode(list);
      }
    } catch {}
  };
  
  const submitWorkOrder = async () => {
    if (!selectedEpisode?.id) return;
    try {
      const resp = await fetch(apiUrl('/api/agent/work-order'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episode_id: selectedEpisode.id,
          assignee: workOrderForm.assignee || '未分配',
          priority: workOrderForm.priority,
          notes: workOrderForm.notes || ''
        })
      });
      const data = await resp.json();
      if (data?.success) {
        setShowWorkOrderModal(false);
        await openEpisodeDetail(selectedEpisode.id);
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 overflow-hidden relative">
      <header className="h-16 border-b border-blue-900/30 bg-slate-900/90 backdrop-blur-md flex items-center justify-between px-6 shadow-lg z-50 relative">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-blue-300">
              隧道风险管控智能体
            </h1>
            <p className="text-[10px] text-cyan-600 font-mono tracking-[0.2em] uppercase">Tunnel Risk Analysis & Control Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700">
          <span className="text-xs text-slate-400 px-2 font-bold uppercase">模拟风险场景:</span>
          <select
            className="bg-slate-900 border border-slate-600 text-xs text-slate-200 rounded px-2 py-1 focus:border-cyan-500 outline-none"
            onChange={e => {
              if (e.target.value) triggerRiskScenario(e.target.value as 'personnel' | 'gas' | 'vehicle');
              else resetSystem();
            }}
            value={activeRisk?.type || ''}
          >
            <option value="">-- 系统正常运行 --</option>
            <option value="personnel">⚠️ 人员入侵 (管片区)</option>
            <option value="gas">☠️ 瓦斯超限 (刀盘区)</option>
            <option value="vehicle">🚜 车辆碰撞 (物流区)</option>
          </select>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('agent')}
              className={`px-3 py-1 rounded text-xs font-bold border ${activeTab === 'agent' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
            >
              智能管控
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded text-xs font-bold border ${activeTab === 'history' ? 'bg-cyan-600 text-white border-cyan-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
            >
              历史记录
            </button>
          </div>
          <div
            className={`px-3 py-1 rounded-full border flex items-center gap-2 text-xs font-bold transition-all duration-300 ${systemStatus === 'normal'
              ? 'bg-green-900/20 border-green-500/50 text-green-400'
              : 'bg-red-900/20 border-red-500/50 text-red-500 animate-pulse'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${systemStatus === 'normal' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {systemStatus === 'normal' ? 'SYSTEM SECURE' : 'RISK DETECTED'}
          </div>
        </div>
      </header>

      <main className="p-4 grid grid-cols-12 gap-4 h-[calc(100vh-64px)] relative z-10">
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 overflow-y-auto pr-1">
          <Card title="多源数据实时聚合" icon={Activity} className="h-1/3">
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind size={12} /> CH4 浓度 (刀盘)
                  </span>
                  <span className={`font-mono font-bold ${activeRisk?.type === 'gas' ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                    {gasData[gasData.length - 1].value.toFixed(2)}%
                  </span>
                </div>
                <div className="h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={gasData}>
                      <Line type="monotone" dataKey="value" stroke={activeRisk?.type === 'gas' ? '#ef4444' : '#22c55e'} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="threshold" stroke="#94a3b8" strokeDasharray="3 3" dot={false} strokeWidth={1} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Anchor size={12} /> 土仓压力 (bar)
                  </span>
                  <span className="font-mono text-cyan-400">{pressureData[pressureData.length - 1].value.toFixed(2)}</span>
                </div>
                <div className="h-12 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={pressureData}>
                      <defs>
                        <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPress)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
          <Card title="地质与变形监测" icon={Eye} className="flex-1">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                <div className="text-[10px] text-slate-500 mb-1">地表沉降 (mm)</div>
                <div className="text-xl font-mono text-white">-12.4</div>
                <div className="text-[10px] text-yellow-500">⚠ 接近预警值</div>
              </div>
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                <div className="text-[10px] text-slate-500 mb-1">地下水位 (m)</div>
                <div className="text-xl font-mono text-white">8.5</div>
                <div className="text-[10px] text-green-500">正常范围</div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-xs font-bold text-cyan-500 border-b border-cyan-900/30 pb-1">重点风险源扫描</div>
              {[
                { label: '房屋桩基群', status: 'safe', dist: '15m' },
                { label: '燃气管线 Φ500', status: 'warning', dist: '3.2m' },
                { label: '废弃人防空洞', status: 'safe', dist: '45m' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/30 p-2 rounded text-xs">
                  <span className="text-slate-300">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">{item.dist}</span>
                    {item.status === 'safe' ? (
                      <span className="text-green-400 bg-green-900/30 px-1.5 py-0.5 rounded">安全</span>
                    ) : (
                      <span className="text-yellow-400 bg-yellow-900/30 px-1.5 py-0.5 rounded animate-pulse">关注</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 右侧区域放大为主体 (占9列) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
          {activeTab === 'history' && (
            <Card title="历史风险事件记录" icon={AlertTriangle} className="h-full flex flex-row">
              <div className="w-[35%] border-r border-slate-800 pr-3 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">最近 10 条</span>
                  {episodesLoading && <Loader2 className="animate-spin text-slate-500" size={14} />}
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {episodes.map((e) => (
                    <button
                      key={e.id}
                      onClick={() => openEpisodeDetail(e.id)}
                      className={`w-full text-left p-3 rounded border ${selectedEpisode?.id === e.id ? 'border-cyan-500 bg-cyan-900/10' : 'border-slate-700 bg-slate-800/40'} hover:bg-slate-800`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-cyan-300">{e.risk_type || '未知'}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${e.risk_level ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-800 text-slate-400'}`}>{e.risk_level || '未评级'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{e.location || '-'}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{new Date(e.created_at).toLocaleString()}</div>
                      {workOrdersForEpisode.some(w => w.episode_id === e.id) && (
                        <div className="mt-1 text-[10px] text-green-400 bg-green-900/30 inline-block px-1.5 rounded">已创建工单</div>
                      )}
                    </button>
                  ))}
                  {episodes.length === 0 && !episodesLoading && (
                    <div className="text-xs text-slate-500">暂无历史记录</div>
                  )}
                </div>
              </div>
              <div className="flex-1 pl-3 flex flex-col">
                {!selectedEpisode ? (
                  <div className="flex-1 flex items-center justify-center text-slate-600 opacity-50">选择左侧事件查看详情</div>
                ) : (
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-cyan-200">{selectedEpisode.risk_type} · {selectedEpisode.location}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setShowWorkOrderModal(true)}
                          className="px-3 py-1 rounded text-xs font-bold bg-cyan-600 text白 hover:bg-cyan-500"
                        >
                          转工单
                        </button>
                        {workOrdersForEpisode.length > 0 && (
                          <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded">工单 {workOrdersForEpisode[0].status}</span>
                        )}
                      </div>
                    </div>
                    {selectedEpisode.analysis_result && (
                      <div className="bg-indigo-950/20 border border-indigo-500/30 rounded p-3">
                        <div className="text-xs font-bold text-indigo-300 mb-2">分析结果</div>
                        <div className="text-sm text-slate-200">{selectedEpisode.analysis_result}</div>
                      </div>
                    )}
                    {selectedEpisode.decision_plan && Array.isArray(selectedEpisode.decision_plan) && (
                      <div className="bg-slate-800/50 border border-slate-700 rounded p-3">
                        <div className="text-xs font-bold text-cyan-300 mb-2">决策方案</div>
                        <div className="space-y-2">
                          {selectedEpisode.decision_plan.map((p: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-start">
                              <div className="w-6 h-6 rounded-full bg-cyan-600 text白 flex items-center justify-center text-xs font-bold">{p.step || idx + 1}</div>
                              <div className="flex-1">
                                <div className="text-sm text-slate-100">{p.action || ''}</div>
                                <div className="text-[10px] text-slate-400">{p.reason || ''}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedEpisode.reasoning_steps && Array.isArray(selectedEpisode.reasoning_steps) && (
                      <div className="bg-slate-800/30 border border-slate-700 rounded p-3">
                        <div className="text-xs font-bold text-slate-300 mb-2">推理日志</div>
                        <div className="space-y-1">
                          {selectedEpisode.reasoning_steps.map((s: any, i: number) => (
                            <div key={i} className="text-[10px] text-slate-300">• {s.message || s}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
          {activeTab === 'agent' && (
          <Card title="智能风险管控中心" icon={AlertTriangle} className="h-full flex flex-col" alertLevel={activeRisk ? 'critical' : 'normal'}>
            {agentState !== 'idle' ? (
              <div className="flex h-full gap-4 animate-in fade-in slide-in-from-right-4 duration-500">

                {/* 左半部分：日志与决策 (占40%) */}
                <div className="w-[40%] flex flex-col gap-4">
                  <div className="bg-black/40 border border-slate-700 rounded p-3 h-1/2 flex flex-col font-mono overflow-hidden">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-2">
                      <Terminal size={10} />
                      AGENT_LOGS
                      {agentState === 'thinking' && <span className="animate-pulse text-cyan-400">● PROCESSING</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-hide">
                      {agentLogs.map((log, idx) => (
                        <div key={log.id} className={`text-[10px] flex gap-2 animate-in fade-in slide-in-from-left-2`}>
                          <span className="text-slate-600">[{new Date(log.id).toLocaleTimeString([], { hour12: false })}]</span>
                          <span
                            className={`${log.type === 'warning'
                              ? 'text-yellow-400'
                              : log.type === 'critical'
                                ? 'text-red-400'
                                : log.type === 'success'
                                  ? 'text-green-400'
                                  : 'text-slate-300'
                              }`}
                          >
                            {idx === agentLogs.length - 1 && agentState !== 'executing' ? '> ' : ''}
                            {log.message}
                          </span>
                        </div>
                      ))}
                      <div ref={logsEndRef} />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto relative bg-slate-900/30 p-2 rounded border border-slate-800">
                    {decisionPlan.length > 0 ? (
                      <div className="space-y-3 animate-in zoom-in-95 duration-500">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="text-cyan-400 text-sm font-bold uppercase flex items-center gap-1">
                            <GitBranch size={14} /> 自动生成管控策略
                          </h5>
                        </div>
                        {decisionPlan.map((plan, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 items-start bg-slate-800/80 p-3 rounded border-l-4 border-cyan-500 shadow-lg transform transition-all duration-500 hover:bg-slate-800"
                            style={{ animationDelay: `${idx * 200}ms` }}
                          >
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-cyan-600 text-white shadow-[0_0_10px_rgba(8,145,178,0.5)]">
                              {plan.step}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-100 mb-1">{plan.action}</p>
                              <p className="text-[10px] text-slate-400">{plan.reason}</p>
                            </div>
                            {plan.auto && <CheckCircle2 size={16} className="text-green-500 ml-auto animate-in fade-in duration-500" />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-cyan-500/30 animate-pulse">
                        <Cpu size={48} className="opacity-20" />
                        <span className="absolute mt-16 text-xs">正在计算最优决策...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 右半部分：深度简报 (占60%，作为主角) */}
                <div className="flex-1 flex flex-col">
                  {isAnalyzing && !aiAnalysis && (
                    <div className="h-full flex items-center justify-center bg-indigo-950/20 border border-indigo-500/30 rounded">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin text-indigo-400" size={32} />
                        <span className="text-sm text-indigo-300 font-bold tracking-wider animate-pulse">智能体正在生成深度简报...</span>
                      </div>
                    </div>
                  )}
                  {aiAnalysis && (
                    <div className="h-full max-h-[calc(100vh-280px)] bg-indigo-950/20 border border-indigo-500/30 rounded flex flex-col animate-in slide-in-from-bottom-5 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]">
                      <div className="flex items-center gap-3 px-6 pt-4 pb-3 border-b border-indigo-500/30 shrink-0">
                        <div className="bg-indigo-500/20 p-2 rounded text-indigo-400">
                          <Bot size={24} />
                        </div>
                        <span className="text-xl font-black text-indigo-100 tracking-wider">智能体深度简报</span>
                        <span className="ml-auto text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">AI GENERATED</span>
                      </div>

                      <div className="flex-1 overflow-y-scroll px-6 py-4" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                        <ReactMarkdown
                          components={{
                            h1: ({ children }: { children?: React.ReactNode }) => <h1 className="text-2xl font-black text-white mt-4 mb-3 border-b border-slate-700 pb-2">{children}</h1>,
                            h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-xl font-bold text-blue-300 mt-5 mb-2 border-l-4 border-blue-500 pl-3">{children}</h2>,
                            h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-lg font-bold text-cyan-300 mt-4 mb-2">{children}</h3>,
                            p: ({ children }: { children?: React.ReactNode }) => <p className="text-base leading-relaxed text-slate-200 mb-3">{children}</p>,
                            strong: ({ children }: { children?: React.ReactNode }) => <strong className="text-white font-bold bg-white/10 px-1 rounded">{children}</strong>,
                            em: ({ children }: { children?: React.ReactNode }) => <em className="text-cyan-200 italic">{children}</em>,
                            ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside text-slate-300 mb-3 ml-2 space-y-1">{children}</ul>,
                            ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside text-slate-300 mb-3 ml-2 space-y-1">{children}</ol>,
                            li: ({ children }: { children?: React.ReactNode }) => <li className="text-slate-300">{children}</li>,
                            hr: () => <hr className="my-4 border-slate-700" />,
                            code: ({ children }: { children?: React.ReactNode }) => <code className="bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-mono text-sm">{children}</code>,
                          }}
                        >
                          {aiAnalysis}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50 bg-slate-900/30 rounded border border-slate-800/50 border-dashed">
                <Shield size={64} className="mb-4 text-slate-700" />
                <p className="text-lg font-bold text-slate-500">当前无风险事件</p>
                <p className="text-sm font-mono mt-2">智能体正在全域巡检中...</p>
              </div>
            )}
          </Card>
          )}
        </div>
      </main>

      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${showChat ? 'w-80 h-96' : 'w-12 h-12'}`}>
        {!showChat ? (
          <button
            onClick={() => setShowChat(true)}
            className="w-12 h-12 bg-cyan-600 rounded-full shadow-[0_0_20px_rgba(8,145,178,0.5)] flex items-center justify-center hover:scale-110 transition-transform text-white group"
          >
            <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
        ) : (
          <div className="w-full h-full bg-slate-900 border border-cyan-800 rounded-lg shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
            <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-slate-200">智能安全助手</span>
              </div>
              <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] p-2 rounded-lg text-xs leading-relaxed ${msg.role === 'user'
                      ? 'bg-cyan-700 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'
                      }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-2 rounded-lg rounded-bl-none border border-slate-700">
                    <Loader2 className="animate-spin text-slate-500" size={14} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form
              onSubmit={async e => {
                e.preventDefault();
                if (!chatInput.trim() || isChatThinking) return;
                const msg = chatInput;
                setChatInput('');
                setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
                setIsChatThinking(true);

                try {
                  // 优先使用 RAG 增强的智能体对话 API
                  const resp = await fetch(apiUrl('/api/agent/chat'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: msg,
                      context: {
                        system_status: systemStatus,
                        active_risk: activeRisk?.title || null
                      }
                    })
                  });

                  if (resp.ok) {
                    const data = await resp.json();
                    if (data.success && data.response) {
                      setChatHistory(prev => [...prev, { role: 'model', text: data.response }]);
                      setIsChatThinking(false);
                      return;
                    }
                  }
                } catch (err) {
                  console.warn('[Chat] Agent API failed, falling back to direct LLM');
                }

                // 降级：使用直接 LLM 调用
                const prompt = `用户提问: \"${msg}\"。当前系统处于${systemStatus}状态。${activeRisk ? `正在处理${activeRisk.title}风险。` : ''} 请简短回答。`;
                const response = await callGemini(prompt);
                setChatHistory(prev => [...prev, { role: 'model', text: response }]);
                setIsChatThinking(false);
              }}
              className="p-2 bg-slate-900 border-t border-slate-800 flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="询问安全规范..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" className="p-1.5 bg-cyan-600 text-white rounded hover:bg-cyan-500">
                <Send size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
      {showWorkOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
          <div className="w-[420px] bg-slate-900 border border-slate-700 rounded-lg p-4">
            <div className="text-sm font-bold text-slate-200 mb-3">创建工单</div>
            <div className="space-y-3">
              <div>
                <div className="text-[10px] text-slate-400 mb-1">指派人</div>
                <input
                  type="text"
                  value={workOrderForm.assignee}
                  onChange={e => setWorkOrderForm({ ...workOrderForm, assignee: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 mb-1">优先级</div>
                <select
                  value={workOrderForm.priority}
                  onChange={e => setWorkOrderForm({ ...workOrderForm, priority: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 mb-1">备注</div>
                <textarea
                  value={workOrderForm.notes}
                  onChange={e => setWorkOrderForm({ ...workOrderForm, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-1.5 text-xs text白 focus:outline-none focus:border-cyan-500 h-20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowWorkOrderModal(false)} className="px-3 py-1.5 text-xs rounded border border-slate-700 text-slate-300">取消</button>
              <button onClick={submitWorkOrder} className="px-3 py-1.5 text-xs rounded bg-cyan-600 text-white hover:bg-cyan-500">提交</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TunnelRiskAgent;
