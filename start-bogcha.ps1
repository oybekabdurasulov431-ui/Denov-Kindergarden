$ErrorActionPreference = 'SilentlyContinue'
$proj = 'C:\Users\user\Downloads\Telegram Desktop\bogcham web sayt va mukammal'
$urlFile = "$env:USERPROFILE\Desktop\SAYT_MANZILI.txt"

# 1) Node server (3000-port)
$portOpen = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $portOpen) {
  Start-Process -FilePath 'C:\Program Files\nodejs\node.exe' -ArgumentList 'server.js' -WorkingDirectory $proj -WindowStyle Hidden
}

# 2) Sayt manzilini desktop fayliga yozish
Set-Content -Path $urlFile -Value "Sizning sayt manzilingiz: https://mexriddin.online`r`nLogin: mexriddin`r`nParol: 000000" -Encoding UTF8
