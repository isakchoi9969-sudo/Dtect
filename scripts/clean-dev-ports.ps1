# Local development only: free the ports used by the D:TECT frontend, backend, and AI server.
# 5174~5176 are included to clean Vite instances that auto-incremented
# after a previous 5173 process was left running.
$devPorts = @(3000, 5173, 5174, 5175, 5176, 8000)
$portPattern = ":($($devPorts -join '|'))$"

# Get-NetTCPConnection may briefly retain a PID after its process has exited.
# Read netstat's current LISTENING rows instead, so stale PIDs are not targeted.
$listenerProcessIds = netstat -ano |
  Select-String "LISTENING" |
  ForEach-Object {
    $columns = $_.Line -split "\s+" | Where-Object { $_ }
    if ($columns.Count -ge 5 -and $columns[1] -match $portPattern) {
      [int]$columns[-1]
    }
  } |
  Sort-Object -Unique

if ($listenerProcessIds.Count -eq 0) {
  Write-Host "No existing D:TECT development servers found."
  exit 0
}

foreach ($listenerProcessId in $listenerProcessIds) {
  $process = Get-Process -Id $listenerProcessId -ErrorAction SilentlyContinue
  if (-not $process) {
    # The process ended between netstat and this check; there is nothing to stop.
    continue
  }

  try {
    $processName = $process.ProcessName
    # /T stops nodemon and uvicorn reload child processes as well.
    & taskkill.exe /PID $listenerProcessId /T /F | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "taskkill exited with code $LASTEXITCODE"
    }
    Write-Host "Stopped $processName (PID $listenerProcessId)."
  } catch {
    Write-Warning "Could not stop PID ${listenerProcessId}: $($_.Exception.Message)"
  }
}

for ($attempt = 1; $attempt -le 10; $attempt += 1) {
  $remainingListeners = netstat -ano |
    Select-String "LISTENING" |
    Where-Object {
      $columns = $_.Line -split "\s+" | Where-Object { $_ }
      $columns.Count -ge 5 -and $columns[1] -match $portPattern
    }
  if (-not $remainingListeners) {
    exit 0
  }
  Start-Sleep -Milliseconds 200
}

Write-Warning "One or more development ports are still in use. Check ports 3000, 5173-5176, and 8000."
