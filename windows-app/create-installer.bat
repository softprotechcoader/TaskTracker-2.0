@echo off
echo =======================================
echo  Task Tracker Windows Installer Builder
echo =======================================
echo.

:: Change to the directory where the batch file is located
cd /d "%~dp0"
echo Working directory: %CD%
echo.

:: Check for Admin privileges
NET SESSION >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo This script requires administrator privileges.
    echo Right-click on the script and select "Run as administrator".
    echo.
    pause
    exit /b 1
)

echo Building Windows installer...
echo.

:: Ensure directories exist
if not exist "assets\icons" mkdir "assets\icons"
if not exist "assets\installer" mkdir "assets\installer"

:: Check if icon exists, if not create a simple placeholder
if not exist "assets\icons\icon.ico" (
    echo Creating placeholder icon...
    copy nul "assets\icons\icon.ico" >nul
    copy nul "assets\icons\taskdb.ico" >nul
)

:: Create simple sidebar bitmap if not exists
if not exist "assets\installer\sidebar.bmp" (
    echo Creating installer sidebar image...
    echo This is a placeholder file > "assets\installer\sidebar.bmp.txt"
    rename "assets\installer\sidebar.bmp.txt" "sidebar.bmp"
)

:: Install or update dependencies
echo Installing dependencies...
echo Running: npm install
call npm install

echo.
echo Creating Windows installer...
echo.

:: Check if package.json exists
if not exist "package.json" (
    echo.
    echo Error: package.json not found in current directory: %CD%
    echo This script must be run from the windows-app directory containing package.json.
    echo.
    pause
    exit /b 1
)

:: Build the installer
echo Running: npm run build-installer
call npm run build-installer

if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Failed to build the installer.
    echo.
    echo Possible solutions:
    echo 1. Make sure you are running as Administrator
    echo 2. Check if all dependencies are installed
    echo 3. Look for error messages above for specific issues
    echo.
    pause
    exit /b 1
)

echo.
echo Installer created successfully!
echo.
echo The installer can be found in the 'dist' folder:
echo %CD%\dist\TaskTracker-Setup-1.0.0.exe
echo.
echo To install the application:
echo 1. Run the installer
echo 2. Follow the installation wizard
echo 3. Launch Task Tracker from the Start Menu
echo.

pause 