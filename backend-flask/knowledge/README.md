# 知识库目录

此目录用于存放智能体 RAG 检索的知识文档。

## 目录结构

- `regulations/` - 安全规范文档
- `cases/` - 历史案例
- `vector_db/` - Chroma 向量数据库（自动生成）

## 内置规范

当前系统已内置以下规范文档（编码在 `agent/rag.py` 中）：

1. **SOP-GAS-001** - 瓦斯浓度超限处置规范
2. **SOP-PERSONNEL-001** - 人员入侵危险区域处置规范  
3. **SOP-VEHICLE-001** - 车辆防撞预警处置规范
4. **通用安全要求** - 盾构施工通用安全规范
5. **历史案例** - 2023年瓦斯突出事件

## 添加自定义文档

可以通过以下方式添加新文档：

1. 将 PDF/TXT 文件放入 `regulations/` 目录
2. 调用 API 动态添加：

```python
from agent.rag import KnowledgeBase
kb = KnowledgeBase()
kb.add_document(
    content="文档内容...",
    source="文档来源",
    category="gas"  # gas/personnel/vehicle/general
)
```
