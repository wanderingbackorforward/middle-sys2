"""
RAG 知识库模块 - 安全规范与案例检索

使用 Chroma 向量数据库存储盾构施工安全规范文档
"""

import os
from pathlib import Path
from typing import List, Optional

from langchain_core.documents import Document


class KnowledgeBase:
    """
    知识库管理类
    
    支持两种模式:
    1. 向量检索模式 (需要 chromadb + embeddings)
    2. 关键词匹配模式 (降级方案)
    """
    
    def __init__(self, persist_dir: str = None):
        self.persist_dir = persist_dir or os.path.join(
            os.path.dirname(__file__), "..", "knowledge", "vector_db"
        )
        self._vectorstore = None
        self._documents = self._load_builtin_docs()
    
    def _load_builtin_docs(self) -> List[Document]:
        """加载内置知识库文档"""
        docs = [
            # 瓦斯/气体相关规范
            Document(
                page_content="""【瓦斯浓度超限处置规范 SOP-GAS-001】
                
1. 立即响应措施：
   - 当CH4浓度≥0.5%时，立即切断刀盘和螺旋机电源
   - 启动隧道主风机强排模式，风量提升至100%
   - 停止一切可能产生火花的作业
   
2. 人员撤离：
   - 危险区域内人员沿安全通道有序撤离
   - 撤离至风门以外安全区域
   - 清点人数，确保无人滞留
   
3. 持续监测：
   - 每5分钟记录一次气体浓度变化
   - 浓度降至0.3%以下方可恢复作业
   - 分析气体来源，排查地质异常""",
                metadata={"source": "盾构施工安全规范", "category": "gas", "version": "2024"}
            ),
            
            # 人员入侵相关规范
            Document(
                page_content="""【人员入侵危险区域处置规范 SOP-PERSONNEL-001】
                
1. 设备紧急制动：
   - 立即触发拼装机/盾构机紧急停止
   - 锁定所有移动设备
   - 开启区域声光报警
   
2. 现场响应：
   - 通知最近的安全员前往确认
   - 推送实时画面至监控中心
   - 记录入侵时间、位置、人员信息
   
3. 恢复作业条件：
   - 确认危险区域无人员
   - 安全员签字确认
   - 解除设备锁定""",
                metadata={"source": "盾构施工安全规范", "category": "personnel", "version": "2024"}
            ),
            
            # 车辆碰撞相关规范
            Document(
                page_content="""【车辆防撞预警处置规范 SOP-VEHICLE-001】
                
1. 预警响应：
   - 向超速/接近车辆发送减速指令
   - 激活防撞雷达预警系统
   - 锁定前方道岔系统
   
2. 交通管控：
   - 临时封闭危险路段
   - 引导车辆至临时停靠区
   - 通知调度中心重新规划路线
   
3. 事后处理：
   - 分析违规原因（超速/违规行驶）
   - 对驾驶员进行安全教育
   - 更新车辆调度系统黑名单""",
                metadata={"source": "盾构施工安全规范", "category": "vehicle", "version": "2024"}
            ),
            
            # 通用安全规范
            Document(
                page_content="""【盾构施工通用安全要求】
                
1. 作业前检查：
   - 确认通风系统运行正常
   - 检查气体监测设备状态
   - 验证通讯系统畅通
   
2. 应急预案：
   - 每月进行一次应急演练
   - 明确各岗位职责和撤离路线
   - 配备充足的应急物资
   
3. 监控要求：
   - 关键区域实现24小时视频监控
   - 传感器数据实时上传监控中心
   - 异常情况自动触发报警""",
                metadata={"source": "盾构施工安全规范", "category": "general", "version": "2024"}
            ),
            
            # 历史案例
            Document(
                page_content="""【历史案例：2023年某地铁项目瓦斯突出事件】

事件概述：
- 掘进过程中遇到断层破碎带，瓦斯快速涌出
- CH4浓度在3分钟内从0.1%升至1.2%

处置过程：
1. 自动检测系统触发报警（响应时间<2秒）
2. 刀盘电源自动切断
3. 风机自动切换至强排模式
4. 12名作业人员在4分钟内全部撤离

经验教训：
- 穿越断层前应加强超前地质预报
- 提前储备应急通风能力
- 自动化响应系统有效降低人为延误""",
                metadata={"source": "历史案例库", "category": "gas", "case_id": "CASE-2023-001"}
            )
        ]
        return docs
    
    def _init_vectorstore(self):
        """初始化向量存储（懒加载）"""
        if self._vectorstore is not None:
            return
        
        try:
            from langchain_community.vectorstores import Chroma
            from langchain_community.embeddings import HuggingFaceEmbeddings
            
            # 使用轻量级中文嵌入模型
            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
                model_kwargs={'device': 'cpu'}
            )
            
            self._vectorstore = Chroma.from_documents(
                documents=self._documents,
                embedding=embeddings,
                persist_directory=self.persist_dir
            )
        except ImportError:
            print("[KnowledgeBase] Warning: chromadb/embeddings not available, using keyword search")
            self._vectorstore = None
    
    def search(self, query: str, k: int = 3, category: str = None) -> List[Document]:
        """
        检索相关文档
        
        Args:
            query: 检索查询
            k: 返回文档数量
            category: 可选，筛选特定类别
        """
        # 尝试使用向量检索
        try:
            self._init_vectorstore()
            if self._vectorstore:
                if category:
                    results = self._vectorstore.similarity_search(
                        query, k=k,
                        filter={"category": category}
                    )
                else:
                    results = self._vectorstore.similarity_search(query, k=k)
                return results
        except Exception as e:
            print(f"[KnowledgeBase] Vector search failed: {e}")
        
        # 降级：关键词匹配
        return self._keyword_search(query, k, category)
    
    def _keyword_search(self, query: str, k: int, category: str = None) -> List[Document]:
        """关键词匹配（降级方案）"""
        results = []
        query_lower = query.lower()
        
        for doc in self._documents:
            # 类别过滤
            if category and doc.metadata.get("category") != category:
                continue
            
            # 简单关键词匹配
            content_lower = doc.page_content.lower()
            score = 0
            for word in query_lower.split():
                if word in content_lower:
                    score += 1
            
            if score > 0:
                doc.metadata["score"] = score
                results.append((score, doc))
        
        # 按匹配度排序
        results.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in results[:k]]
    
    def add_document(self, content: str, source: str, category: str, **metadata):
        """添加新文档到知识库"""
        doc = Document(
            page_content=content,
            metadata={"source": source, "category": category, **metadata}
        )
        self._documents.append(doc)
        
        # 如果向量库已初始化，也添加到向量库
        if self._vectorstore:
            self._vectorstore.add_documents([doc])
    
    def get_categories(self) -> List[str]:
        """获取所有文档类别"""
        categories = set()
        for doc in self._documents:
            cat = doc.metadata.get("category")
            if cat:
                categories.add(cat)
        return list(categories)
