-- =====================================================
-- 智能体长期记忆表结构 (在 Supabase SQL Editor 中执行)
-- =====================================================

-- 1. 事件记忆表 (Episodic Memory)
-- 记录每次风险事件的处理过程和结果
CREATE TABLE IF NOT EXISTS agent_episodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- 事件基本信息
    risk_type VARCHAR(50) NOT NULL,           -- gas/personnel/vehicle
    risk_level VARCHAR(50),                   -- 风险等级
    location VARCHAR(200),                    -- 发生位置
    
    -- 传感器快照
    sensor_snapshot JSONB,                    -- 事件发生时的传感器数据
    
    -- 智能体分析结果
    analysis_result TEXT,                     -- 分析结论
    decision_plan JSONB,                      -- 决策方案 [{step, action, auto}]
    retrieved_docs JSONB,                     -- RAG 检索到的文档
    reasoning_steps JSONB,                    -- 推理步骤
    
    -- 执行反馈
    execution_status VARCHAR(50) DEFAULT 'pending',  -- pending/executed/failed
    feedback TEXT,                            -- 人工反馈/事后评价
    effectiveness_score INT,                  -- 有效性评分 1-5
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- 元数据
    auto_triggered BOOLEAN DEFAULT FALSE,     -- 是否自动触发
    operator VARCHAR(100) DEFAULT 'AI_AGENT'  -- 操作者
);

-- 为常用查询创建索引
CREATE INDEX IF NOT EXISTS idx_episodes_risk_type ON agent_episodes(risk_type);
CREATE INDEX IF NOT EXISTS idx_episodes_created_at ON agent_episodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_location ON agent_episodes(location);


-- 2. 用户偏好表 (User Preferences)
-- 存储决策风格和个性化配置
CREATE TABLE IF NOT EXISTS agent_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    user_id VARCHAR(100) DEFAULT 'default',   -- 用户/项目标识
    
    -- 决策风格
    decision_style VARCHAR(50) DEFAULT 'balanced',  -- conservative/balanced/aggressive
    
    -- 自动化程度
    auto_execute_level INT DEFAULT 2,         -- 1=仅建议, 2=低风险自动, 3=全自动
    
    -- 通知偏好
    notify_on_detection BOOLEAN DEFAULT TRUE,
    notify_on_completion BOOLEAN DEFAULT TRUE,
    
    -- 其他配置
    custom_rules JSONB,                       -- 自定义规则
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认配置
INSERT INTO agent_preferences (user_id, decision_style, auto_execute_level)
VALUES ('default', 'balanced', 2)
ON CONFLICT DO NOTHING;


-- 3. 相似事件检索视图
-- 用于快速查找历史相似案例
CREATE OR REPLACE VIEW similar_episodes AS
SELECT 
    id,
    risk_type,
    risk_level,
    location,
    analysis_result,
    decision_plan,
    effectiveness_score,
    created_at,
    CASE 
        WHEN effectiveness_score >= 4 THEN '成功案例'
        WHEN effectiveness_score <= 2 THEN '失败案例'
        ELSE '一般案例'
    END as case_quality
FROM agent_episodes
WHERE execution_status = 'executed'
ORDER BY created_at DESC;


-- =====================================================
-- 使用说明
-- =====================================================
-- 
-- 1. 复制以上 SQL 到 Supabase Dashboard -> SQL Editor
-- 2. 点击 Run 执行
-- 3. 检查 Table Editor 确认表已创建
--
-- 表说明：
-- - agent_episodes: 存储每次风险事件的完整处理记录
-- - agent_preferences: 存储用户的决策偏好配置
-- - similar_episodes: 视图，用于快速检索成功案例
