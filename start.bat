@echo off
setlocal
cd /d "%~dp0"

if "%PORT%"=="" set PORT=5150
if "%HOSTNAME%"=="" set HOSTNAME=0.0.0.0

:: Ensure Node is in PATH if running from Task Scheduler or system account
where node >nul 2>&1
if errorlevel 1 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%PATH%"
    )
)

echo [%DATE% %TIME%] Starting Random Video Player on http://%HOSTNAME%:%PORT% >> "%~dp0server.log"

if exist "%~dp0dist\server.js" (
  node "%~dp0dist\server.js" >> "%~dp0server.log" 2>&1
) else if exist "%~dp0.next\standalone\server.js" (
  node "%~dp0.next\standalone\server.js" >> "%~dp0server.log" 2>&1
) else (
  call npm run start >> "%~dp0server.log" 2>&1
)
