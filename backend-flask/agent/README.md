# 智能体模块配置说明

## 前置条件

### 1. 安装 Python 依赖

```powershell
cd backend-flask
pip install -r requirements.txt
```

**新增依赖说明：**
- `langchain` / `langgraph` - 智能体框架，用于构建多步骤推理工作流
- `chromadb` - 向量数据库，用于 RAG 知识检索（可选，有降级方案）
- `sentence-transformers` - 文本嵌入模型（可选，用于向量化）

### 2. 环境变量配置

在 `backend-flask/.env` 中配置（或通过系统环境变量）：

```bash
# 必须：大模型 API Key（二选一）
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx
# 或
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxx

# 可选：已有的配置保持不变
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
USE_SUPABASE=1
DISABLE_SCHEDULER=1
```

> **重要**：智能体复用了项目现有的 `DEEPSEEK_API_KEY` 配置，无需额外申请新 Key。

### 3. Windows PowerShell 快速设置

```powershell
$env:DEEPSEEK_API_KEY='sk-xxxxxxxxxxxxxxxxxxxxxx'
$env:DISABLE_SCHEDULER='1'
python app.py
```

---

## 新增 API 端点

| 端点 | 方法 | 功能 |
|------|------|------|
| `/api/agent/analyze` | POST | 触发 LangGraph 智能体分析风险 |
| `/api/agent/chat` | POST | RAG 增强的智能对话 |
| `/api/agent/knowledge` | GET | 获取知识库信息 |
| `/api/agent/knowledge/search` | POST | 检索知识库文档 |

---

## 架构说明

本次重构**复用了项目现有结构**：

1. **复用 Flask 后端**：在 `app.py` 中新增端点，不改变原有架构
2. **复用 DeepSeek API**：使用已配置的 `DEEPSEEK_API_KEY`，无需新 Key
3. **复用 SSE 机制**：智能体状态通过 `sse_hub` 广播
4. **内置知识库**：安全规范直接编码在 `agent/rag.py` 中，无需额外文件

### 文件结构

```
backend-flask/
├── agent/                 # 新增：智能体模块
│   ├── __init__.py
│   ├── graph.py          # LangGraph 工作流
│   ├── rag.py            # RAG 知识库（内置规范）
│   └── tools.py          # 工具函数
├── knowledge/            # 新增：知识库目录（可选扩展）
│   └── README.md
└── app.py                # 修改：添加智能体 API 端点
```

---

## 降级机制

系统设计了多层降级保障：

1. **向量检索失败** → 自动降级为关键词匹配
2. **智能体 API 失败** → 前端自动降级为直接 LLM 调用
3. **无 chromadb** → 使用内置关键词搜索

---

## 验证测试

```powershell
# 1. 测试知识库检索
Invoke-RestMethod -Uri "http://localhost:8081/api/agent/knowledge/search" `
  -Method POST -ContentType "application/json" `
  -Body '{"query": "瓦斯超限"}'

# 2. 测试智能体分析
Invoke-RestMethod -Uri "http://localhost:8081/api/agent/analyze" `
  -Method POST -ContentType "application/json" `
  -Body '{"risk_type": "gas", "sensor_data": {"ch4": 0.92}}'
```
