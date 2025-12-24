. "$PSScriptRoot\env.ps1"; . "$PSScriptRoot\rest.ps1"
$now = Get-Date
InsertRows 'settlement_actual' @(@{ ts = ($now).ToUniversalTime().ToString('o'); value = 10.3 })
InsertRows 'settlement_predict' @(@{ ts = ($now).ToUniversalTime().ToString('o'); value = 11.0 })
InsertRows 'alarm_trend' @(@{ ts = ($now).ToUniversalTime().ToString('o'); value = 2 })
InsertRows 'risks' @(@{ ts = ($now).ToUniversalTime().ToString('o'); level='High'; name='Gas Pipeline'; status='Active'; description='Control pressure fluctuation'; code='YZ10302' })
$adv = @(); for ($i=0; $i -lt 24; $i++) { $adv += @{ ts = ($now.AddHours(-$i)).ToUniversalTime().ToString('o'); value = [Math]::Round(8 + (Get-Random -Maximum 2.0) - 1.0,2) } }
InsertRows 'advance_speed' $adv
$slurry = @(); for ($i=0; $i -lt 24; $i++) { $slurry += @{ ts = ($now.AddHours(-$i)).ToUniversalTime().ToString('o'); value = [Math]::Round(0.42 + (Get-Random -Maximum 0.06) - 0.03,2) } }
InsertRows 'slurry_pressure' $slurry
$gas = @(); for ($i=0; $i -lt 24; $i++) { $gas += @{ ts = ($now.AddHours(-$i)).ToUniversalTime().ToString('o'); value = 10 + (Get-Random -Minimum 0 -Maximum 6) } }
InsertRows 'gas_concentration' $gas
InsertRows 'summary' @(@{ ts = ($now).ToUniversalTime().ToString('o'); ring_today=12; ring_cumulative=1978; muck_today=252.9; slurry_pressure_avg=0.43; camera_online=1017; camera_total=1415 })
$att=@(); for($i=0;$i -lt 12;$i++){ $att += @{ ts=($now.AddHours(-$i)).ToUniversalTime().ToString('o'); value=420 + (Get-Random -Minimum -40 -Maximum 40) } }
InsertRows 'attendance_trend' $att
InsertRows 'stats' @(@{ ts=($now).ToUniversalTime().ToString('o'); total_on_site=482; attendance_rate='98.5%'; violations=3; managers=45 })
$dr=@(); for($i=0;$i -lt 14;$i++){ $dr += @{ ts=($now.AddDays(-$i)).ToUniversalTime().ToString('o'); value=10 + (Get-Random -Minimum 0 -Maximum 6) } }
InsertRows 'daily_rings' $dr
InsertRows 'stats_progress' @(@{ ts=($now).ToUniversalTime().ToString('o'); total_rings=1978; total_goal=2400; daily_rings=12; remaining_days=145; value=35430 })
# dashboard lists
$notes=@(
  @{ ts=($now.AddMinutes(-3)).ToUniversalTime().ToString('o'); type='Drive'; content='Left line completed 1020 rings' },
  @{ ts=($now.AddMinutes(-5)).ToUniversalTime().ToString('o'); type='Grout'; content='Tail grout pressure stabilized' },
  @{ ts=($now.AddMinutes(-10)).ToUniversalTime().ToString('o'); type='Device'; content='Belt short stop, resumed' },
  @{ ts=($now.AddMinutes(-12)).ToUniversalTime().ToString('o'); type='Monitor'; content='DK12+200 settlement near threshold' },
  @{ ts=($now.AddMinutes(-15)).ToUniversalTime().ToString('o'); type='Safety'; content='Segment transport crowding relieved' }
)
InsertRows 'notifications' $notes
$sup=@(
  @{ category='Grout'; quantity=4500 },
  @{ category='Cement'; quantity=3200 },
  @{ category='PPE'; quantity=3500 },
  @{ category='Lighting'; quantity=1200 },
  @{ category='Other'; quantity=500 }
)
InsertRows 'supplies' $sup
$dispatch=@(
  @{ ts=($now.AddMinutes(-3)).ToUniversalTime().ToString('o'); type='Drive'; unit='TBM Ops'; status='Processing' },
  @{ ts=($now.AddMinutes(-12)).ToUniversalTime().ToString('o'); type='Monitor'; unit='Monitoring Dept'; status='Pending' },
  @{ ts=($now.AddMinutes(-30)).ToUniversalTime().ToString('o'); type='Device'; unit='Maintenance'; status='Done' }
)
InsertRows 'dispatch' $dispatch
Write-Host 'Seeding done.'
