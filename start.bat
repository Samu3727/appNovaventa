@echo off
echo ========================================
echo   NovaVenta - Sistema de Gestion
echo ========================================
echo.

echo [1/3] Verificando MySQL...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MySQL no encontrado. Instala MySQL primero.
    pause
    exit /b 1
)
echo [OK] MySQL instalado

echo.
echo [2/3] Iniciando Backend en puerto 8000...
cd Backend
start cmd /k "npm start"

echo.
echo [3/3] Iniciando Frontend Expo...
cd ..\novaventa
start cmd /k "npm start"

echo.
echo ========================================
echo   Servidores iniciados!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: Escanea el QR con Expo Go
echo.
echo Presiona cualquier tecla para continuar...
pause >nul
