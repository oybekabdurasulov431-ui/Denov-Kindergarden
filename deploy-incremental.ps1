param(
  [string]$Ip = "80.89.238.78",
  [string]$Password = "Mm977853808m$"
)
$ErrorActionPreference = "Stop"
Import-Module Posh-SSH
$pw = ConvertTo-SecureString $Password -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential("root", $pw)
$session = New-SSHSession -ComputerName $Ip -Credential $cred -AcceptKey -ConnectionTimeout 30
if (!$session) { Write-Host "XATO: ulanish amalga oshmadi" -ForegroundColor Red; exit 1 }
Write-Host "Ulangan." 

$base = "C:\Users\user\Downloads\Telegram Desktop\bogcham web sayt va mukammal"
Write-Host "Fayllar yuklanmoqda..."
Set-SCPItem -ComputerName $Ip -Credential $cred -Path "$base\server.js" -Destination "/root/bogcham/" -AcceptKey -Force
Set-SCPItem -ComputerName $Ip -Credential $cred -Path "$base\db.js" -Destination "/root/bogcham/" -AcceptKey -Force
Set-SCPItem -ComputerName $Ip -Credential $cred -Path "$base\public\app.js" -Destination "/root/bogcham/public/" -AcceptKey -Force
Set-SCPItem -ComputerName $Ip -Credential $cred -Path "$base\public\style.css" -Destination "/root/bogcham/public/" -AcceptKey -Force

Write-Host "Rebuild + restart..."
$remote = @"
cd /root/bogcham
docker compose up -d --build
sleep 6
docker compose ps
curl -s -o /dev/null -w 'local http status: %{http_code}\n' http://localhost
"@
$res = Invoke-SSHCommand -SessionId $session.SessionId -Command $remote -TimeOut 600
$res.Output | ForEach-Object { Write-Host $_ }
Remove-SSHSession -SessionId $session.SessionId | Out-Null
Write-Host "=== TAYYOR ===" -ForegroundColor Green
