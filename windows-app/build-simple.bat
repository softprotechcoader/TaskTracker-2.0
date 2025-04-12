@echo off
echo ===== Task Tracker Simple Build Script =====

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in the PATH.
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
  echo Error: Failed to install dependencies.
  exit /b 1
)

REM Create icon placeholder
echo Creating placeholder icons...
if not exist "assets\icons" mkdir "assets\icons"
copy nul "assets\icons\icon.ico" >nul
copy nul "assets\icons\taskdb.ico" >nul

REM Choose build type
echo.
echo Choose a build type:
echo 1 - Development build
echo 2 - Packaged application (without installer)
echo 3 - Windows installer (NSIS)
echo 4 - Portable executable
echo.

set /p BUILD_TYPE="Enter option (1-4): "

if "%BUILD_TYPE%"=="1" (
  echo Starting in development mode...
  call npm start
) else if "%BUILD_TYPE%"=="2" (
  echo Creating packaged application...
  call electron-packager . TaskTracker --platform=win32 --arch=x64 --out=dist/ --overwrite
) else if "%BUILD_TYPE%"=="3" (
  echo Creating Windows installer...
  call electron-builder --win
) else if "%BUILD_TYPE%"=="4" (
  echo Creating portable executable...
  call electron-builder --win portable
) else (
  echo Invalid option selected.
  exit /b 1
)

if %ERRORLEVEL% neq 0 (
  echo Build process failed.
  exit /b 1
) else (
  echo.
  echo Build completed successfully!
  echo.
  if "%BUILD_TYPE%"=="2" (
    echo Packaged application available in: dist\TaskTracker-win32-x64\
  ) else if "%BUILD_TYPE%"=="3" (
    echo Installer available in: dist\Task-Tracker-Setup-1.0.0.exe
  ) else if "%BUILD_TYPE%"=="4" (
    echo Portable executable available in: dist\Task-Tracker-Portable-1.0.0.exe
  )
)

pause 