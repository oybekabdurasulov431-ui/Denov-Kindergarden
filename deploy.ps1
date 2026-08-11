param(
  [Parameter(Mandatory = $true)][string]$Ip,
  [Parameter(Mandatory = $true)][string]$Password,
  [string]$Domain = "mexriddin.uz",
  [string]$Zip = "C:\Users\user\AppData\Local\Temp\opencode\bogcham-server.zip"
)

$ErrorActionPreference = "Stop"

if (!(Test-Path -LiteralPath $Zip)) { Write-Host "XATO: zip topilmadi: $Zip" -ForegroundColor Red; exit 1 }

if (!(Get-Module -ListAvailable -Name Posh-SSH)) {
  Write-Host "[1/5] Posh-SSH o'rnatilmoqda (SSH uchun) ..." -ForegroundColor Cyan
  Install-Module Posh-SSH -Scope CurrentUser -Force -SkipPublisherCheck
}
Import-Module Posh-SSH

Write-Host "[2/5] Serverga ulanmoqda: root@$Ip ..." -ForegroundColor Cyan
$pw = ConvertTo-SecureString $Password -AsPlainText -Force
$cred = New-Object System.Management.Automation.PSCredential("root", $pw)
$session = New-SSHSession -ComputerName $Ip -Credential $cred -AcceptKey -ConnectionTimeout 30
if (!$session) { Write-Host "XATO: ulanish amalga oshmadi. IP/parolni tekshiring." -ForegroundColor Red; exit 1 }

Write-Host "[3/5] bogcham-server.zip yuklanmoqda ..." -ForegroundColor Cyan
Set-SCPItem -ComputerName $Ip -Credential $cred -Path $Zip -Destination "/root/" -AcceptKey -Force
$r = Invoke-SSHCommand -SessionId $session.SessionId -Command "test -f /root/bogcham-server.zip && echo ZIP_OK"
if ($r.Output -notmatch "ZIP_OK") { Write-Host "XATO: zip yuklanmadi." -ForegroundColor Red; exit 1 }

$remote = @"
set -e
export DEBIAN_FRONTEND=noninteractive
cd /root
echo '--- update+install ---'
apt-get update -y
apt-get install -y docker.io docker-compose-v2 ufw unzip curl ca-certificates
echo '--- unzip ---'
rm -rf /root/bogcham
unzip -o -q /root/bogcham-server.zip -d /root/bogcham
cd /root/bogcham
echo '--- domain ---'
sed -i 's/YOUR-DOMAIN-HERE.COM/$Domain/g' Caddyfile
grep -n 'reverse_proxy' Caddyfile || true
echo '--- firewall ---'
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo '--- build+start ---'
docker compose up -d --build
sleep 5
docker compose ps
"@

Write-Host "[4/5] O'rnatish bajarilmoqda (2-5 daqiqa) ..." -ForegroundColor Cyan
$res = Invoke-SSHCommand -SessionId $session.SessionId -Command $remote -TimeOut 600
$res.Output | ForEach-Object { Write-Host $_ }
if ($res.Output -match "ERROR|error:|Exit") { }

Write-Host "[5/5] Tekshirish ..." -ForegroundColor Cyan
Start-Sleep -Seconds 5
$check = Invoke-SSHCommand -SessionId $session.SessionId -Command "curl -s -o /dev/null -w '%{http_code}' -k https://$Domain || curl -s -o /dev/null -w '%{http_code}' http://$Domain"
$check.Output | ForEach-Object { Write-Host "HTTP status: $_" }

Remove-SSHSession -SessionId $session.SessionId | Out-Null
Write-Host ""
Write-Host "=== TAYYOR ===" -ForegroundColor Green
Write-Host "Sayt: https://$Domain" -ForegroundColor Green
Write-Host "Kirish: mexriddin / mexriddin123" -ForegroundColor Green
Write-Host "Server: root@$Ip" -ForegroundColor Green
