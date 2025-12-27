## 目标
- 以脚本自动联通 Supabase：配置、数据初始化（DML）、持续写入时序数据（可选），避免手工操作。
- 保持现有前端/后端接口结构不变，先用脚本把各表填充基础数据，然后逐模块切换到数据库数据源。

## 两条可选方案
- 方案 A（CLI 优先）：使用 Supabase CLI 执行迁移与种子数据
 1. 安装 CLI（若 GitHub 受限，改用官方下载域名）
    - Windows 独立二进制（推荐）：从官方下载 supabase.exe 到 `%USERPROFILE%\Tools`，加入 PATH
    - 设置令牌：`$env:SUPABASE_ACCESS_TOKEN='sbp_...'`
 2. 项目绑定与迁移
    - `supabase init`
    - `supabase link --project-ref komlrqbghyirkykmibrx`
    - 在 `supabase/migrations/*.sql` 写入已确认的 DDL；`supabase db push`
 3. 填充种子数据
    - 在 `supabase/seed.sql` 写入 INSERT（见下方）
    - `supabase db reset`（可选）或 `supabase db push && supabase db seed`
- 方案 B（REST 脚本）：不依赖 CLI，直接用 PowerShell 调 Supabase PostgREST 初始化各表数据（DML）
 1. 环境变量
    - `SUPABASE_URL=https://komlrqbghyirkykmibrx.supabase.co`
    - `SUPABASE_SERVICE_KEY=<你的服务端密钥>`（仅服务器端）
 2. 公用脚本（PowerShell）
    - `scripts/supabase/env.ps1`
```
$env:SUPABASE_URL='https://komlrqbghyirkykmibrx.supabase.co'
$env:SUPABASE_SERVICE_KEY='<service-secret>'
```
    - `scripts/supabase/rest.ps1`
```
param()
function Invoke-Supa {
  param([string]$Method,[string]$Path,[object]$Body)
  $headers = @{ 'apikey' = $env:SUPABASE_SERVICE_KEY; 'Authorization' = "Bearer $env:SUPABASE_SERVICE_KEY"; 'Content-Type' = 'application/json'; 'Prefer'='return=minimal' }
  $url = "$($env:SUPABASE_URL)/rest/v1/$Path"
  if ($Method -eq 'POST') { return Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body ($Body | ConvertTo-Json -Depth 6) }
  if ($Method -eq 'GET')  { return Invoke-RestMethod -Method Get  -Uri "$url?select=*" -Headers $headers }
}
function InsertRows { param([string]$Table,[object[]]$Rows) foreach ($row in $Rows) { Invoke-Supa 'POST' $Table $row } }
```
    - `scripts/supabase/seed.ps1`
```
. "$PSScriptRoot/env.ps1"; . "$PSScriptRoot/rest.ps1"
InsertRows 'settlement_actual' @(@{ ts = (Get-Date).ToUniversalTime().ToString('o'); value = 10.3 })
InsertRows 'settlement_predict' @(@{ ts = (Get-Date).ToUniversalTime().ToString('o'); value = 11.0 })
InsertRows 'alarm_trend' @(@{ ts = (Get-Date).ToUniversalTime().ToString('o'); value = 2 })
InsertRows 'risks' @(@{ ts = (Get-Date).ToUniversalTime().ToString('o'); level='一级风险'; name='下穿燃气管线'; status='进行中'; description='严格控制土仓压力波动'; code='YZ10302' })
# 安全大屏（示例 24 小时）
$now = Get-Date
$adv = @(); for ($i=0; $i -lt 24; $i++) { $adv += @{ ts = ($now.AddHours(-$i)).ToUniversalTime().ToString('o'); value = [Math]::Round(8 + (Get-Random -Maximum 1.0),2) } }
InsertRows 'advance_speed' $adv
$slurry = @(); for ($i=0; $i -lt 24; $i++) { $slurry += @{ ts = ($now.AddHours(-$i)).ToUniversalTime().ToString('o'); value = [Math]::Round(0.42 + (Get-Random -Maximum 0.05),2) } }
InsertRows 'slurry_pressure' $slurry
$gas = @(); for ($i=0; $i -lt 24; $i++) { $gas += @{ ts = ($now.AddHours(-$i)).ToUniversalTime().ToString('o'); value = 10 + (Get-Random -Minimum 0 -Maximum 6) } }
InsertRows 'gas_concentration' $gas
InsertRows 'summary' @(@{ ts = (Get-Date).ToUniversalTime().ToString('o'); ring_today=12; ring_cumulative=1978; muck_today=252.9; slurry_pressure_avg=0.43; camera_online=1017; camera_total=1415 })
# 人员/进度（简化）
$att=@(); for($i=0;$i -lt 12;$i++){ $att += @{ ts=($now.AddHours(-$i)).ToUniversalTime().ToString('o'); value=420 + (Get-Random -Minimum -40 -Maximum 40) } }
InsertRows 'attendance_trend' $att
InsertRows 'stats' @(@{ ts=(Get-Date).ToUniversalTime().ToString('o'); total_on_site=482; attendance_rate='98.5%'; violations=3; managers=45 })
$dr=@(); for($i=0;$i -lt 14;$i++){ $dr += @{ ts=($now.AddDays(-$i)).ToUniversalTime().ToString('o'); value=10 + (Get-Random -Minimum 0 -Maximum 6) } }
InsertRows 'daily_rings' $dr
InsertRows 'stats_progress' @(@{ ts=(Get-Date).ToUniversalTime().ToString('o'); total_rings=1978; total_goal=2400; daily_rings=12; remaining_days=145; value=35430 })
Write-Host 'Seeding done.'
```
 3. 运行
    - `powershell -ExecutionPolicy Bypass -File .\scripts\supabase\seed.ps1`

## 持续写入（可选）
- `scripts/supabase/append.ps1`：每 60s 追加一批时序点（advance_speed/slurry_pressure/gas_concentration/attendance_trend/daily_rings），用于演示实时变化。
- 可作为 Windows 计划任务运行，或在开发时手动执行。

## 验证方式
- REST：用 `rest.ps1` 的 `Invoke-Supa 'GET' <table>` 检查最新数据行数
- 后端：`GET /api/safety/verify`（已存在），后续为 dashboard/personnel/progress 也加只读 verify 端点
- 前端：页面不变化，图表与卡片有数据即可；切到数据库后仍保持同字段结构

## 安全与密钥管理
- 所有密钥仅经环境变量注入，不写入任何代码或 Git 提交
- 脚本读取 `SUPABASE_SERVICE_KEY`；此 key 只在服务端使用

## 你这边需要执行的最少动作
- 提供/设置环境变量：`SUPABASE_URL` 与 `SUPABASE_SERVICE_KEY`
- 运行 `seed.ps1` 完成一次性填充；若需实时滚动，运行 `append.ps1`

确认后，我将把这些脚本与对应的后端只读 verify 端点（针对 dashboard/personnel/progress）一起补齐，并完成切换，让前端无感使用数据库数据。