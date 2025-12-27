param(
  [string]$SupabaseUrl = "",
  [string]$SupabaseServiceKey = "",
  [switch]$UseSupabase = $false,
  [int]$Threads = 20,
  [switch]$StartFrontend = $false
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
if (-not (Test-Path "backend-flask")) { throw "backend-flask not found" }
Set-Location "backend-flask"
if (-not (Test-Path "venv")) {
  python -m venv venv
}
if (Test-Path "requirements.txt") {
  & ".\venv\Scripts\pip.exe" install -r requirements.txt
} else {
  & ".\venv\Scripts\pip.exe" install flask flask-cors requests apscheduler waitress python-dotenv
}
if ($SupabaseUrl) { $env:SUPABASE_URL = $SupabaseUrl }
if ($SupabaseServiceKey) { $env:SUPABASE_SERVICE_KEY = $SupabaseServiceKey }
$env:USE_SUPABASE = if ($UseSupabase) { "1" } else { "0" }
$waitressArgs = "-m waitress --host 0.0.0.0 --port 8081 --threads $Threads app:app"
Start-Process -FilePath ".\venv\Scripts\python.exe" -ArgumentList $waitressArgs -WorkingDirectory (Get-Location)
if ($StartFrontend) {
  Set-Location "$root\frontend"
  Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory (Get-Location)
}
