@echo off
title Bogcham - Maktabgacha ta'lim boshqaruv tizimi
cd /d "%~dp0"
echo ============================================
echo   BOGCHAM - Boshqaruv tizimi
echo   Sahifa: http://localhost:3000
echo   Login: mexriddin   Parol: 000000
echo ============================================
echo.
echo Serverni to'xtatish uchun shu oynani yopish kifoya.
echo.
start "" "http://localhost:3000"
node server.js
echo.
echo Server to'xtadi yoki xatolik yuz berdi.
pause
