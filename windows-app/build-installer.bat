@echo off
echo ============================================
echo  Task Tracker Windows Installer Builder
echo ============================================
echo.

:: Change to the directory where the batch file is located
cd /d "%~dp0"
echo Working directory: %CD%
echo.

:: Check for package.json
if not exist "package.json" (
    echo Error: package.json not found in %CD%
    echo This script must be run from the windows-app directory.
    pause
    exit /b 1
)

:: Create necessary directories
echo Creating necessary asset directories...
if not exist "assets" mkdir "assets"
if not exist "assets\icons" mkdir "assets\icons"
if not exist "assets\installer" mkdir "assets\installer"

:: Create placeholder files
echo Creating placeholder files...
if not exist "assets\icons\icon.ico" copy nul "assets\icons\icon.ico" >nul
if not exist "assets\icons\taskdb.ico" copy nul "assets\icons\taskdb.ico" >nul
if not exist "assets\installer\sidebar.bmp" copy nul "assets\installer\sidebar.bmp" >nul

:: Update package.json
echo Updating package.json for installer build...
node update-package.js
if %ERRORLEVEL% neq 0 (
    echo Failed to update package.json
    pause
    exit /b 1
)

:: Install dependencies
echo Installing dependencies...
call npm install --no-optional

:: Build the installer
echo.
echo Building installer (this may take a few minutes)...
echo.
call npx electron-builder --win --x64

if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Failed to build the installer.
    echo.
    echo Possible solutions:
    echo 1. Make sure you are running as Administrator
    echo 2. Check if all dependencies are installed
    echo 3. Install Node.js LTS from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo.
echo Installer created successfully!
echo The installer can be found in the 'dist' folder:
echo %CD%\dist\
echo.
echo To install the application:
echo 1. Navigate to the dist folder
echo 2. Run the installer file (Task-Tracker-Setup-*.exe)
echo 3. Follow the installation wizard
echo.

pause 