# Local development only: free the ports used by the D:TECT frontend, backend, and AI server.
$devPorts = @(3000, 5173, 6000)
$listenerProcessIds = [System.Collections.Generic.HashSet[int]]::new()

foreach ($devPort in $devPorts) {
  $listeners = Get-NetTCPConnection -LocalPort $devPort -State Listen -ErrorAction SilentlyContinue
  foreach ($listener in $listeners) {
    [void]$listenerProcessIds.Add([int]$listener.OwningProcess)
  }
}

if ($listenerProcessIds.Count -eq 0) {
  Write-Host "No existing D:TECT development servers found."
  exit 0
}

foreach ($listenerProcessId in $listenerProcessIds) {
  try {
    $processName = (Get-Process -Id $listenerProcessId -ErrorAction Stop).ProcessName
    Stop-Process -Id $listenerProcessId -Force -ErrorAction Stop
    Write-Host "Stopped $processName (PID $listenerProcessId)."
  } catch {
    Write-Warning "Could not stop PID ${listenerProcessId}: $($_.Exception.Message)"
  }
}

for ($attempt = 1; $attempt -le 10; $attempt += 1) {
  $remainingListeners = Get-NetTCPConnection -LocalPort $devPorts -State Listen -ErrorAction SilentlyContinue
  if (-not $remainingListeners) {
    exit 0
  }
  Start-Sleep -Milliseconds 200
}

Write-Warning "One or more development ports are still in use. Check ports 3000, 5173, and 6000."
