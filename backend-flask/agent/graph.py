"""
LangGraph 工作流定义 - 隧道风险管控智能体

实现多步骤推理的智能体工作流:
感知 → 分析 → 检索 → 规划 → 执行
"""

import os
import json
from typing import TypedDict, Annotated, Sequence, Literal
from datetime import datetime

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from .tools import get_tools
from .rag import KnowledgeBase


# ============== 状态定义 ==============

class AgentState(TypedDict):
    """智能体状态"""
    # 输入
    risk_type: str                    # 风险类型: personnel, gas, vehicle
    sensor_data: dict                 # 传感器数据
    location: str                     # 位置信息
    
    # 中间状态
    risk_level: str                   # 风险等级: low, medium, high, critical
    analysis_result: str              # 分析结果
    retrieved_docs: list              # RAG 检索到的文档
    reasoning_steps: list             # 推理步骤记录
    
    # 输出
    decision_plan: list               # 决策方案
    report: str                       # 最终报告
    
    # 消息历史
    messages: Sequence[BaseMessage]


# ============== 节点函数 ==============

def perceive_node(state: AgentState) -> AgentState:
    """感知节点：收集和解析传感器数据"""
    steps = state.get("reasoning_steps", [])
    steps.append({
        "node": "perceive",
        "time": datetime.now().isoformat(),
        "message": f"[感知层] 接收到风险信号，类型: {state['risk_type']}"
    })
    
    sensor_info = state.get("sensor_data", {})
    steps.append({
        "node": "perceive",
        "time": datetime.now().isoformat(),
        "message": f"[数据层] 聚合传感器数据: {json.dumps(sensor_info, ensure_ascii=False)}"
    })
    
    return {**state, "reasoning_steps": steps}


def analyze_node(state: AgentState) -> AgentState:
    """分析节点：使用 LLM 进行风险分析"""
    steps = state.get("reasoning_steps", [])
    
    # 获取 LLM
    api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY", "")
    base_url = "https://api.deepseek.com" if os.getenv("DEEPSEEK_API_KEY") else None
    
    llm = ChatOpenAI(
        model="deepseek-chat" if os.getenv("DEEPSEEK_API_KEY") else "gpt-4o-mini",
        api_key=api_key,
        base_url=base_url,
        temperature=0.3
    )
    
    # 构建分析 prompt
    risk_type = state["risk_type"]
    sensor_data = state.get("sensor_data", {})
    
    prompt = f"""作为盾构隧道施工安全专家，分析以下风险：

风险类型: {risk_type}
传感器数据: {json.dumps(sensor_data, ensure_ascii=False)}
位置: {state.get('location', '未知')}

请判断风险等级（low/medium/high/critical）并给出初步分析。
返回 JSON 格式: {{"level": "...", "analysis": "..."}}"""
    
    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        result = json.loads(response.content)
        risk_level = result.get("level", "medium")
        analysis = result.get("analysis", response.content)
    except:
        risk_level = "high" if risk_type == "gas" else "medium"
        analysis = response.content
    
    steps.append({
        "node": "analyze",
        "time": datetime.now().isoformat(),
        "message": f"[认知层] 风险特征分析完成"
    })
    steps.append({
        "node": "analyze",
        "time": datetime.now().isoformat(),
        "message": f"[决策层] 判定风险等级为: {risk_level}"
    })
    
    return {
        **state,
        "risk_level": risk_level,
        "analysis_result": analysis,
        "reasoning_steps": steps
    }


def retrieve_node(state: AgentState) -> AgentState:
    """检索节点：RAG 知识库检索"""
    steps = state.get("reasoning_steps", [])
    
    steps.append({
        "node": "retrieve",
        "time": datetime.now().isoformat(),
        "message": "[知识库] 检索《盾构施工安全规范》及历史案例库..."
    })
    
    # 初始化知识库
    kb = KnowledgeBase()
    
    # 构建检索查询
    risk_type = state["risk_type"]
    query = f"{risk_type} 风险处置规范"
    
    # 执行检索
    docs = kb.search(query, k=3)
    
    retrieved = []
    for doc in docs:
        retrieved.append({
            "content": doc.page_content,
            "source": doc.metadata.get("source", "unknown"),
            "relevance": doc.metadata.get("score", 0)
        })
    
    steps.append({
        "node": "retrieve",
        "time": datetime.now().isoformat(),
        "message": f"[知识库] 检索到 {len(retrieved)} 条相关规范"
    })
    
    return {
        **state,
        "retrieved_docs": retrieved,
        "reasoning_steps": steps
    }


def plan_node(state: AgentState) -> AgentState:
    """规划节点：生成决策方案"""
    steps = state.get("reasoning_steps", [])
    
    api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY", "")
    base_url = "https://api.deepseek.com" if os.getenv("DEEPSEEK_API_KEY") else None
    
    llm = ChatOpenAI(
        model="deepseek-chat" if os.getenv("DEEPSEEK_API_KEY") else "gpt-4o-mini",
        api_key=api_key,
        base_url=base_url,
        temperature=0.2
    )
    
    # 构建规划 prompt
    docs_text = "\n".join([d["content"] for d in state.get("retrieved_docs", [])])
    
    prompt = f"""作为盾构隧道安全管控智能体，根据以下信息生成处置方案：

风险类型: {state['risk_type']}
风险等级: {state.get('risk_level', 'unknown')}
分析结果: {state.get('analysis_result', '')}
传感器数据: {json.dumps(state.get('sensor_data', {}), ensure_ascii=False)}

参考规范:
{docs_text}

请生成 3-5 条具体的管控措施，按优先级排序。
返回 JSON 数组格式: [{{"step": 1, "action": "...", "auto": true/false, "reason": "..."}}]

其中 auto 表示是否可自动执行，reason 说明依据的规范条款。"""

    response = llm.invoke([HumanMessage(content=prompt)])
    
    try:
        plan = json.loads(response.content)
    except:
        # 解析失败时使用默认方案
        plan = [
            {"step": 1, "action": "启动应急响应程序", "auto": True, "reason": "通用安全规范"},
            {"step": 2, "action": "通知现场安全员", "auto": True, "reason": "人员管理规定"},
            {"step": 3, "action": "持续监测相关参数", "auto": True, "reason": "监控要求"}
        ]
    
    steps.append({
        "node": "plan",
        "time": datetime.now().isoformat(),
        "message": f"[策略层] 生成 {len(plan)} 条管控指令"
    })
    
    return {
        **state,
        "decision_plan": plan,
        "reasoning_steps": steps
    }


def execute_node(state: AgentState) -> AgentState:
    """执行节点：执行自动化指令"""
    steps = state.get("reasoning_steps", [])
    plan = state.get("decision_plan", [])
    
    auto_count = sum(1 for p in plan if p.get("auto", False))
    
    steps.append({
        "node": "execute",
        "time": datetime.now().isoformat(),
        "message": f"[执行层] 已自动执行 {auto_count} 条指令，等待人工确认 {len(plan) - auto_count} 条"
    })
    
    return {**state, "reasoning_steps": steps}


def report_node(state: AgentState) -> AgentState:
    """报告节点：生成最终报告"""
    api_key = os.getenv("DEEPSEEK_API_KEY") or os.getenv("OPENAI_API_KEY", "")
    base_url = "https://api.deepseek.com" if os.getenv("DEEPSEEK_API_KEY") else None
    
    llm = ChatOpenAI(
        model="deepseek-chat" if os.getenv("DEEPSEEK_API_KEY") else "gpt-4o-mini",
        api_key=api_key,
        base_url=base_url,
        temperature=0.3
    )
    
    prompt = f"""生成简要的风险处置报告:

风险类型: {state['risk_type']}
风险等级: {state.get('risk_level')}
分析结果: {state.get('analysis_result')}
处置方案: {json.dumps(state.get('decision_plan', []), ensure_ascii=False)}

格式要求:
1. 风险成因研判
2. 已采取措施
3. 后续建议"""

    response = llm.invoke([HumanMessage(content=prompt)])
    
    return {**state, "report": response.content}


def should_retrieve(state: AgentState) -> str:
    """条件边：判断是否需要检索知识库"""
    risk_level = state.get("risk_level", "medium")
    if risk_level in ["high", "critical"]:
        return "retrieve"
    return "plan"


# ============== 构建图 ==============

def build_graph():
    """构建 LangGraph 工作流"""
    workflow = StateGraph(AgentState)
    
    # 添加节点
    workflow.add_node("perceive", perceive_node)
    workflow.add_node("analyze", analyze_node)
    workflow.add_node("retrieve", retrieve_node)
    workflow.add_node("plan", plan_node)
    workflow.add_node("execute", execute_node)
    workflow.add_node("report", report_node)
    
    # 设置入口
    workflow.set_entry_point("perceive")
    
    # 添加边
    workflow.add_edge("perceive", "analyze")
    workflow.add_conditional_edges(
        "analyze",
        should_retrieve,
        {
            "retrieve": "retrieve",
            "plan": "plan"
        }
    )
    workflow.add_edge("retrieve", "plan")
    workflow.add_edge("plan", "execute")
    workflow.add_edge("execute", "report")
    workflow.add_edge("report", END)
    
    return workflow.compile()


# ============== 智能体类 ==============

class TunnelRiskGraph:
    """隧道风险管控智能体"""
    
    def __init__(self):
        self.graph = build_graph()
    
    def run(self, risk_type: str, sensor_data: dict = None, location: str = "") -> dict:
        """运行智能体"""
        initial_state: AgentState = {
            "risk_type": risk_type,
            "sensor_data": sensor_data or {},
            "location": location,
            "risk_level": "",
            "analysis_result": "",
            "retrieved_docs": [],
            "reasoning_steps": [],
            "decision_plan": [],
            "report": "",
            "messages": []
        }
        
        result = self.graph.invoke(initial_state)
        return result


def run_agent(risk_type: str, sensor_data: dict = None, location: str = "") -> dict:
    """便捷函数：运行智能体"""
    agent = TunnelRiskGraph()
    return agent.run(risk_type, sensor_data, location)
