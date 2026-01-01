"""
智能体工具集 - 传感器查询、规范检索、设备控制等

这些工具可被 LLM 调用来执行实际操作
"""

import os
import json
from datetime import datetime
from typing import Optional
from langchain_core.tools import tool


@tool
def query_sensors(sensor_type: str = "all") -> str:
    """
    查询当前传感器数据
    
    Args:
        sensor_type: 传感器类型 (gas/pressure/temperature/all)
    
    Returns:
        传感器数据 JSON
    """
    # 模拟传感器数据（实际应从数据库/IoT平台获取）
    sensors = {
        "gas": {
            "ch4": 0.08,
            "co": 0.002,
            "o2": 20.5,
            "unit": "%",
            "status": "normal",
            "timestamp": datetime.now().isoformat()
        },
        "pressure": {
            "soil_chamber": 2.45,
            "slurry": 1.82,
            "unit": "bar",
            "status": "normal",
            "timestamp": datetime.now().isoformat()
        },
        "temperature": {
            "ambient": 28.4,
            "motor": 65.2,
            "unit": "°C",
            "status": "normal",
            "timestamp": datetime.now().isoformat()
        }
    }
    
    if sensor_type == "all":
        return json.dumps(sensors, ensure_ascii=False)
    elif sensor_type in sensors:
        return json.dumps(sensors[sensor_type], ensure_ascii=False)
    else:
        return json.dumps({"error": f"Unknown sensor type: {sensor_type}"})


@tool
def retrieve_regulation(category: str, keyword: str = "") -> str:
    """
    检索安全规范文档
    
    Args:
        category: 规范类别 (gas/personnel/vehicle/general)
        keyword: 可选关键词
    
    Returns:
        匹配的规范内容
    """
    from .rag import KnowledgeBase
    
    kb = KnowledgeBase()
    query = f"{category} {keyword}".strip()
    docs = kb.search(query, k=2, category=category)
    
    if not docs:
        return json.dumps({"found": 0, "message": "未找到匹配的规范"})
    
    results = []
    for doc in docs:
        results.append({
            "content": doc.page_content[:500],  # 截断长文本
            "source": doc.metadata.get("source", "unknown")
        })
    
    return json.dumps({"found": len(results), "documents": results}, ensure_ascii=False)


@tool
def send_device_command(device: str, command: str, params: dict = None) -> str:
    """
    发送设备控制指令
    
    Args:
        device: 设备标识 (tbm/fan/alarm/gate)
        command: 指令类型 (stop/start/set)
        params: 指令参数
    
    Returns:
        执行结果
    """
    # 模拟设备控制（实际应对接 PLC/SCADA 系统）
    allowed_devices = ["tbm", "fan", "alarm", "gate", "pump"]
    allowed_commands = ["stop", "start", "set", "reset"]
    
    if device not in allowed_devices:
        return json.dumps({"success": False, "error": f"Unknown device: {device}"})
    
    if command not in allowed_commands:
        return json.dumps({"success": False, "error": f"Invalid command: {command}"})
    
    # 记录指令日志
    log_entry = {
        "device": device,
        "command": command,
        "params": params or {},
        "timestamp": datetime.now().isoformat(),
        "status": "executed"
    }
    
    print(f"[DeviceCommand] {json.dumps(log_entry, ensure_ascii=False)}")
    
    return json.dumps({
        "success": True,
        "device": device,
        "command": command,
        "message": f"{device} {command} 指令已发送"
    }, ensure_ascii=False)


@tool
def log_decision(risk_id: str, decision: str, reason: str) -> str:
    """
    记录决策日志
    
    Args:
        risk_id: 风险事件ID
        decision: 决策内容
        reason: 决策依据
    
    Returns:
        记录结果
    """
    log_entry = {
        "risk_id": risk_id,
        "decision": decision,
        "reason": reason,
        "operator": "AI_AGENT",
        "timestamp": datetime.now().isoformat()
    }
    
    # 实际应写入数据库
    print(f"[DecisionLog] {json.dumps(log_entry, ensure_ascii=False)}")
    
    return json.dumps({
        "logged": True,
        "log_id": f"LOG-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    })


@tool
def query_personnel(zone: str = "all") -> str:
    """
    查询区域人员分布
    
    Args:
        zone: 区域标识 (cutter/segment/logistics/all)
    
    Returns:
        人员信息
    """
    # 模拟人员定位数据
    personnel = {
        "cutter": [
            {"id": "P001", "name": "张三", "role": "掘进操作员", "status": "在岗"},
            {"id": "P002", "name": "李四", "role": "设备监控员", "status": "在岗"}
        ],
        "segment": [
            {"id": "P003", "name": "王五", "role": "拼装工", "status": "在岗"},
            {"id": "P004", "name": "赵六", "role": "质检员", "status": "在岗"}
        ],
        "logistics": [
            {"id": "P005", "name": "钱七", "role": "运输员", "status": "在岗"}
        ]
    }
    
    if zone == "all":
        total = sum(len(p) for p in personnel.values())
        return json.dumps({
            "total": total,
            "by_zone": {k: len(v) for k, v in personnel.items()},
            "details": personnel
        }, ensure_ascii=False)
    elif zone in personnel:
        return json.dumps({
            "zone": zone,
            "count": len(personnel[zone]),
            "personnel": personnel[zone]
        }, ensure_ascii=False)
    else:
        return json.dumps({"error": f"Unknown zone: {zone}"})


def get_tools():
    """获取所有可用工具"""
    return [
        query_sensors,
        retrieve_regulation,
        send_device_command,
        log_decision,
        query_personnel
    ]
