$ErrorActionPreference = 'SilentlyContinue'
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1
Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{ CommandLine = 'C:\Users\user\cloudflared.exe tunnel run bogcha' } | Out-Null
