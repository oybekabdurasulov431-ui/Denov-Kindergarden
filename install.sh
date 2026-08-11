#!/usr/bin/env bash
set -e

echo "======================================"
echo "  BOGCHAM — avtomatik o'rnatish"
echo "======================================"
echo

# 1) Domen sozlash
CUR=$(grep -oE '^[^ ]+' Caddyfile | head -1)
if [ "$CUR" = "YOUR-DOMAIN-HERE.COM" ]; then
  read -rp "Domeningizni kiriting (masalan bogcha.uz): " DOMAIN
  if [ -z "$DOMAIN" ]; then echo "Domen kiritilmadi!"; exit 1; fi
  sed -i "s/YOUR-DOMAIN-HERE.COM/$DOMAIN/" Caddyfile
  echo "Domen sozlandi: $DOMAIN"
else
  DOMAIN=$CUR
  echo "Domen: $DOMAIN"
fi
echo

# 2) Docker o'rnatish (agar yo'q bo'lsa)
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker o'rnatilmoqda..."
  curl -fsSL https://get.docker.com | sh
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin o'rnatilmoqda..."
  apt-get update -y && apt-get install -y docker-compose-plugin
fi
echo "Docker: OK"
echo

# 3) Firewall (port 80 va 443)
if command -v ufw >/dev/null 2>&1; then
  ufw allow 80/tcp >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
  echo "Firewall: 80/443 ochildi"
fi
echo

# 4) Saytni qurish va ishga tushirish
echo "Sayt qurilmoqda (birinchi marta 2-5 daqiqa davom etishi mumkin)..."
docker compose up -d --build
echo

# 5) Natija
echo "======================================"
echo "  O'RNATISH TAYYOR!"
echo "  Sayt: https://$DOMAIN"
echo "  Login: mexriddin"
echo "  Parol: mexriddin123"
echo "  Ma'lumotlar serverda saqlanadi (doim ochiq)"
echo "  Telegram bot avtomatik yoqilgan"
echo "======================================"
echo
echo "Xatolik bo'lsa:  sudo docker compose logs -f app"
echo "Bazani tiklash:  saytda Settings -> Backup"
