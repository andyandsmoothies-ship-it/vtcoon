@echo off
title VTCoOn - Cloudflare Tunnel Launcher
echo ======================================================================
echo    VTCOON 3D - KHOI TAO DUONG HAM CLOUDFLARE CHO BAN BE VAO CHOI
echo ======================================================================
echo.
echo Dang kiem tra ket noi Docker...
docker compose ps | findstr /i "healthy" >nul
if %errorlevel% neq 0 (
    echo [Luu y] Docker chua khoi dong hoac chua san sang.
    echo Dang khoi dong container Docker...
    docker compose up -d
)
echo.
echo ======================================================================
echo   DANG KHOI TAO DUONG HAM MIEN PHI...
echo   VUI LONG SAO CHEP DUONG LINK (dang: https://xxx.trycloudflare.com)
echo   GUI LINK NAY CHO BAN BE VAO CHOI!
echo   (Nhan Ctrl + C de dong duong ham khi choi xong)
echo ======================================================================
echo.
docker run --rm -it --name vtcoon_tunnel --network vtcoon_internal cloudflare/cloudflared:latest tunnel --no-autoupdate --url http://nginx:80
pause
