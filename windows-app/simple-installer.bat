@echo off
echo ============================================
echo  Task Tracker Simple Windows Installer Build
echo ============================================
echo.

:: Change to the directory where the batch file is located
cd /d "%~dp0"
echo Working directory: %CD%
echo.

:: Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found in %CD%
    echo This script must be run from the windows-app directory.
    pause
    exit /b 1
)

:: Create necessary directories
echo Creating necessary directories...
if not exist "assets" mkdir "assets"
if not exist "assets\icons" mkdir "assets\icons"
if not exist "assets\installer" mkdir "assets\installer"

:: Create placeholder icons
echo Creating placeholder icons...
if not exist "assets\icons\icon.ico" copy nul "assets\icons\icon.ico" >nul
if not exist "assets\icons\taskdb.ico" copy nul "assets\icons\taskdb.ico" >nul

:: Create placeholder sidebar
echo Creating simple sidebar image...
if not exist "assets\installer\sidebar.bmp" copy nul "assets\installer\sidebar.bmp" >nul

:: Simplify the package.json for building - with proper module imports
echo Simplifying the build configuration...
echo // Modify package.json for simpler build > temp.js
echo const fs = require('fs'); >> temp.js
echo const path = require('path'); >> temp.js
echo try { >> temp.js
echo   const pkg = require('./package.json'); >> temp.js
echo   pkg.build = pkg.build || {}; >> temp.js
echo   pkg.build.npmRebuild = false; >> temp.js
echo   pkg.build.buildDependenciesFromSource = true; >> temp.js
echo   pkg.build.asar = true; >> temp.js
echo   pkg.build.win = { target: 'nsis', icon: 'assets/icons/icon.ico' }; >> temp.js
echo   pkg.build.nsis = { oneClick: false, allowToChangeInstallationDirectory: true, createDesktopShortcut: true }; >> temp.js
echo   fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2)); >> temp.js
echo   console.log('Package.json simplified for build.'); >> temp.js
echo } catch (err) { >> temp.js
echo   console.error('Error updating package.json:', err); >> temp.js
echo } >> temp.js
node temp.js
del temp.js

:: Install dependencies
echo Installing dependencies...
call npm install --no-optional

echo.
echo Building installer (this may take a few minutes)...
echo.

:: Build with simpler options
call npx electron-builder --win --x64

if %ERRORLEVEL% neq 0 (
    echo.
    echo Error: Failed to build the installer.
    echo.
    echo Retrying with more basic configuration...
    echo.
    
    :: Create even simpler config - with proper module imports
    echo // Create minimal package.json config > temp.js
    echo const fs = require('fs'); >> temp.js
    echo const path = require('path'); >> temp.js
    echo try { >> temp.js
    echo   const pkg = require('./package.json'); >> temp.js
    echo   pkg.build = { >> temp.js
    echo     appId: 'com.tasktracker.windows', >> temp.js
    echo     productName: 'Task Tracker', >> temp.js
    echo     directories: { output: 'dist' }, >> temp.js
    echo     win: { target: 'nsis' }, >> temp.js
    echo     nsis: { oneClick: false } >> temp.js
    echo   }; >> temp.js
    echo   fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2)); >> temp.js
    echo   console.log('Package.json simplified further.'); >> temp.js
    echo } catch (err) { >> temp.js
    echo   console.error('Error updating package.json:', err); >> temp.js
    echo } >> temp.js
    node temp.js
    del temp.js
    
    :: Try building again with the simplest configuration
    call npx electron-builder --win --x64
    
    if %ERRORLEVEL% neq 0 (
        echo.
        echo Failed to build installer after multiple attempts.
        echo.
        echo Please try:
        echo 1. Restart your computer and try again
        echo 2. Make sure you have administrator privileges
        echo 3. Install Node.js from https://nodejs.org/ (LTS version)
        echo.
        pause
        exit /b 1
    )
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