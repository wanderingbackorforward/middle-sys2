param()
function Invoke-Supa {
  param([string]$Method,[string]$Path,[object]$Body)
  $headers = @{ 'apikey' = $env:SUPABASE_ANON_KEY; 'Content-Type' = 'application/json'; 'Prefer'='return=minimal' }
  $url = "$($env:SUPABASE_URL)/rest/v1/$Path"
  if ($Method -eq 'POST') { return Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body ($Body | ConvertTo-Json -Depth 6) }
  if ($Method -eq 'GET')  { return Invoke-RestMethod -Method Get  -Uri "$url?select=*" -Headers $headers }
}
function InsertRows { param([string]$Table,[object[]]$Rows) foreach ($row in $Rows) { Invoke-Supa 'POST' $Table $row } }
