@echo off
echo Looking for Task Tracker installer...

if exist "release\TaskTracker-Setup.exe" (
  echo Found installer at release\TaskTracker-Setup.exe
  echo Running installer...
  start "" "release\TaskTracker-Setup.exe"
) else if exist "release\TaskTracker-Setup-1.0.0.exe" (
  echo Found installer at release\TaskTracker-Setup-1.0.0.exe
  echo Running installer...
  start "" "release\TaskTracker-Setup-1.0.0.exe"
) else (
  echo Installer not found!
  echo Please run "npm run electron:build" or "npm run create-installer" first to create the installer.
  echo Checking for any .exe files in the release directory:
  dir /b release\*.exe
  pause
) 