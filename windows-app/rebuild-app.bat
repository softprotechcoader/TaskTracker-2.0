@echo off
echo ===== Task Tracker App Rebuild Script =====

REM Create necessary directories if they don't exist
echo Creating necessary directories...
if not exist "assets\icons" mkdir "assets\icons"
if not exist "src\css" mkdir "src\css"
if not exist "src\js" mkdir "src\js"

REM Remove node_modules to ensure a clean install
echo Removing node_modules (if exists)...
if exist "node_modules" rmdir /s /q "node_modules"

REM Install dependencies
echo Installing dependencies...
call npm install

REM Verify if necessary files exist
echo Checking files...
set MISSING_FILES=0

if not exist "src\js\history-view.js" (
  echo Missing history-view.js
  set MISSING_FILES=1
)

if not exist "src\js\calendar-view.js" (
  echo Missing calendar-view.js
  set MISSING_FILES=1
)

if %MISSING_FILES% neq 0 (
  echo.
  echo Some required files are missing. Please make sure all JavaScript modules are present.
  echo See app.js to check which modules are imported.
  echo.
)

echo.
echo Rebuild completed!
echo.
echo Next steps:
echo 1. Run the application using: npm start
echo 2. If issues persist, check the console for errors.
echo.

pause 