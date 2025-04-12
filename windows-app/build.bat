@echo off
echo ===== Task Tracker Build Script =====

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Error: Node.js is not installed or not in the PATH.
  echo Please install Node.js from https://nodejs.org/
  exit /b 1
)

REM Check for ImageMagick
where magick >nul 2>nul
if %ERRORLEVEL% neq 0 (
  echo Warning: ImageMagick is not installed or not in the PATH.
  echo Icon generation may fail. Please install ImageMagick from https://imagemagick.org/
)

REM Install dependencies
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
  echo Error: Failed to install dependencies.
  exit /b 1
)

REM Generate icons
echo Generating icons...
call npm run prepare-icons
if %ERRORLEVEL% neq 0 (
  echo Warning: Icon generation failed. Using fallback icons...
)

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
  call npm run pack
) else if "%BUILD_TYPE%"=="3" (
  echo Creating Windows installer...
  call npm run build
) else if "%BUILD_TYPE%"=="4" (
  echo Creating portable executable...
  call npm run build-portable
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