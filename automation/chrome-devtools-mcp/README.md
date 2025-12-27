# 通过 Chrome DevTools MCP Server 发布哔哩哔哩“早上好”动态

## 使用前准备
- 在 Chrome 安装并启用 Chrome DevTools MCP Server。
- 使用已登录哔哩哔哩的 Chrome 用户配置文件。
- 确保助手已连接 MCP Server，并可调用导航、DOM 查询、点击、输入、等待、截图等工具。

## 配方文件
- 配方路径：`automation/chrome-devtools-mcp/bilibili_good_morning.mcp.json`
- 功能：自动打开 `https://t.bilibili.com/`，定位输入框，输入“早上好”，点击发布，并截图保存到 `automation/chrome-devtools-mcp/output/bilibili_good_morning.png`。

## 执行步骤
- 将配方导入到支持 Chrome DevTools MCP Server 的助手/执行器。
- 触发运行：
  - 导航到 `https://t.bilibili.com/`。
  - 若未登录，请在该标签页面先完成登录，再继续执行。
  - 自动定位动态输入区域并输入“早上好”。
  - 自动点击“发布”按钮。
  - 等待新动态出现，并保存截图。

## 验证
- 刷新 `https://t.bilibili.com/`，确认出现一条最新“早上好”动态。
- 可在手机 App 的“动态”页查看同步结果。
- 截图位于 `automation/chrome-devtools-mcp/output/bilibili_good_morning.png`。

## 说明
- 配方已包含多种候选选择器与重试策略，提升页面结构变化下的兼容性。
- 整个流程在本地浏览器内完成，不采集或传输账号信息。

## 在 .claude.json 启用插件
- 若需要在当前项目中启用 Chrome DevTools MCP Server，可将 `automation/chrome-devtools-mcp/claude-project-mcp-config.json` 中的 `projects` 片段合并到你的 `C:\\Users\\monss\\.claude.json` 的 `projects` 节点下：
- 合并后，`C:\\Users\\monss\\Desktop\\middle-sys2` 项目将拥有 `chrome-devtools` 插件配置，便于在该项目中直接调用浏览器自动化。
