"""
智能体长期记忆模块

提供事件记忆 (Episodic Memory) 和用户偏好 (Preferences) 的持久化存储
基于 Supabase 实现
"""

import os
import json
from datetime import datetime
from typing import List, Dict, Optional, Any


class AgentMemory:
    """
    智能体记忆管理器
    
    功能：
    1. 记录每次风险事件的处理过程
    2. 检索历史相似案例
    3. 管理用户决策偏好
    """
    
    def __init__(self):
        self._client = None
        self._init_client()
    
    def _init_client(self):
        """初始化 Supabase 客户端"""
        try:
            from supabase_client import SupabaseClient
            url = os.getenv("SUPABASE_URL", "")
            key = os.getenv("SUPABASE_SERVICE_KEY", "")
            if url and key:
                self._client = SupabaseClient(url, key)
                print("[AgentMemory] Supabase 连接已建立")
            else:
                print("[AgentMemory] 警告: Supabase 未配置，记忆功能将降级为内存模式")
        except ImportError:
            print("[AgentMemory] 警告: supabase_client 不可用")
        
        # 内存降级存储
        self._memory_cache = []
        self._preferences_cache = {
            "decision_style": "balanced",
            "auto_execute_level": 2
        }
    
    # ================= 事件记忆 =================
    
    def save_episode(self, episode: Dict[str, Any]) -> Optional[str]:
        """
        保存事件记忆
        
        Args:
            episode: 事件数据，包含 risk_type, sensor_snapshot, decision_plan 等
        
        Returns:
            episode_id 或 None
        """
        record = {
            "risk_type": episode.get("risk_type", "unknown"),
            "risk_level": episode.get("risk_level"),
            "location": episode.get("location"),
            "sensor_snapshot": json.dumps(episode.get("sensor_data", {})),
            "analysis_result": episode.get("analysis_result"),
            "decision_plan": json.dumps(episode.get("decision_plan", [])),
            "retrieved_docs": json.dumps(episode.get("retrieved_docs", [])),
            "reasoning_steps": json.dumps(episode.get("reasoning_steps", [])),
            "auto_triggered": episode.get("auto_triggered", False)
        }
        
        if self._client:
            try:
                # 写入 Supabase
                result = self._insert_record("agent_episodes", record)
                if result:
                    print(f"[AgentMemory] 事件已保存: {record['risk_type']}")
                    return result.get("id")
            except Exception as e:
                print(f"[AgentMemory] 保存失败: {e}")
        
        # 降级：内存存储
        record["id"] = f"MEM-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        record["created_at"] = datetime.now().isoformat()
        self._memory_cache.append(record)
        return record["id"]
    
    def find_similar_episodes(
        self, 
        risk_type: str, 
        location: str = None, 
        limit: int = 3
    ) -> List[Dict]:
        """
        检索历史相似事件
        
        Args:
            risk_type: 风险类型
            location: 可选，按位置筛选
            limit: 返回数量
        
        Returns:
            相似事件列表
        """
        if self._client:
            try:
                # 从 Supabase 查询
                data = self._client.get_list(
                    "agent_episodes",
                    select="id,risk_type,risk_level,location,analysis_result,decision_plan,effectiveness_score,created_at",
                    order="created_at.desc",
                    limit=limit * 2  # 多取一些再筛选
                )
                
                if data:
                    # 按类型筛选
                    results = [d for d in data if d.get("risk_type") == risk_type]
                    
                    # 如果有位置，优先匹配相同位置
                    if location:
                        same_location = [d for d in results if location in str(d.get("location", ""))]
                        if same_location:
                            results = same_location + [d for d in results if d not in same_location]
                    
                    return results[:limit]
            except Exception as e:
                print(f"[AgentMemory] 检索失败: {e}")
        
        # 降级：从内存缓存检索
        results = [m for m in self._memory_cache if m.get("risk_type") == risk_type]
        return results[-limit:][::-1]
    
    def update_feedback(
        self, 
        episode_id: str, 
        feedback: str, 
        effectiveness_score: int = 3
    ) -> bool:
        """
        更新事件反馈（人工评价）
        
        Args:
            episode_id: 事件ID
            feedback: 反馈内容
            effectiveness_score: 有效性评分 1-5
        """
        if self._client:
            try:
                # 更新 Supabase
                self._update_record("agent_episodes", episode_id, {
                    "feedback": feedback,
                    "effectiveness_score": effectiveness_score,
                    "execution_status": "executed",
                    "resolved_at": datetime.now().isoformat()
                })
                return True
            except Exception as e:
                print(f"[AgentMemory] 更新反馈失败: {e}")
        
        # 降级：更新内存缓存
        for m in self._memory_cache:
            if m.get("id") == episode_id:
                m["feedback"] = feedback
                m["effectiveness_score"] = effectiveness_score
                return True
        return False
    
    # ================= 用户偏好 =================
    
    def get_preferences(self, user_id: str = "default") -> Dict:
        """获取用户偏好"""
        if self._client:
            try:
                data = self._client.get_list(
                    "agent_preferences",
                    select="*",
                    order="created_at.desc",
                    limit=1
                )
                if data:
                    return data[0]
            except Exception as e:
                print(f"[AgentMemory] 获取偏好失败: {e}")
        
        return self._preferences_cache
    
    def update_preferences(self, user_id: str = "default", **kwargs) -> bool:
        """更新用户偏好"""
        self._preferences_cache.update(kwargs)
        
        if self._client:
            try:
                # 这里简化处理，实际应该 upsert
                self._insert_record("agent_preferences", {
                    "user_id": user_id,
                    **kwargs,
                    "updated_at": datetime.now().isoformat()
                })
                return True
            except Exception as e:
                print(f"[AgentMemory] 更新偏好失败: {e}")
        
        return True
    
    # ================= 辅助方法 =================
    
    def _insert_record(self, table: str, record: Dict) -> Optional[Dict]:
        """插入记录到 Supabase"""
        import requests
        
        url = os.getenv("SUPABASE_URL", "").rstrip("/")
        key = os.getenv("SUPABASE_SERVICE_KEY", "")
        
        if not url or not key:
            return None
        
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        try:
            r = requests.post(
                f"{url}/rest/v1/{table}",
                headers=headers,
                json=record,
                timeout=5
            )
            if r.status_code in (200, 201):
                data = r.json()
                return data[0] if isinstance(data, list) and data else data
        except Exception as e:
            print(f"[AgentMemory] Insert error: {e}")
        
        return None
    
    def _update_record(self, table: str, record_id: str, updates: Dict) -> bool:
        """更新 Supabase 记录"""
        import requests
        
        url = os.getenv("SUPABASE_URL", "").rstrip("/")
        key = os.getenv("SUPABASE_SERVICE_KEY", "")
        
        if not url or not key:
            return False
        
        headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json"
        }
        
        try:
            r = requests.patch(
                f"{url}/rest/v1/{table}?id=eq.{record_id}",
                headers=headers,
                json=updates,
                timeout=5
            )
            return r.status_code in (200, 204)
        except Exception as e:
            print(f"[AgentMemory] Update error: {e}")
        
        return False
    
    def get_memory_summary(self) -> Dict:
        """获取记忆库摘要信息"""
        summary = {
            "backend": "supabase" if self._client else "memory",
            "cache_size": len(self._memory_cache)
        }
        
        if self._client:
            try:
                count = self._client.count("agent_episodes")
                summary["total_episodes"] = count
            except:
                pass
        
        return summary


# 全局单例
_memory_instance = None

def get_memory() -> AgentMemory:
    """获取记忆管理器单例"""
    global _memory_instance
    if _memory_instance is None:
        _memory_instance = AgentMemory()
    return _memory_instance
