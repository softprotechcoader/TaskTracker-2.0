# Build script for Task Tracker application

Write-Host "Starting Task Tracker build process..." -ForegroundColor Green

# Step 1: Build the React application
Write-Host "Building React application..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building React application" -ForegroundColor Red
    exit 1
}

# Step 2: Prepare the build for Electron
Write-Host "Preparing build for Electron..." -ForegroundColor Cyan
node fix-electron-build.js
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error preparing build for Electron" -ForegroundColor Red
    exit 1
}

# Step 3: Create the installer
Write-Host "Creating installer with InnoSetup..." -ForegroundColor Cyan

# Check if InnoSetup is installed
$InnoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (-not (Test-Path $InnoSetupPath)) {
    Write-Host "InnoSetup not found. Downloading and installing..." -ForegroundColor Yellow
    
    $InnoSetupUrl = "https://files.jrsoftware.org/is/6/innosetup-6.2.2.exe"
    $InnoSetupInstaller = "$env:TEMP\innosetup-6.2.2.exe"
    
    # Download InnoSetup
    Invoke-WebRequest -Uri $InnoSetupUrl -OutFile $InnoSetupInstaller
    
    # Install InnoSetup silently
    Start-Process -FilePath $InnoSetupInstaller -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART" -Wait
    
    # Verify installation
    if (-not (Test-Path $InnoSetupPath)) {
        Write-Host "InnoSetup installation failed. Please install it manually." -ForegroundColor Red
        exit 1
    }
}

# Run InnoSetup
Start-Process -FilePath $InnoSetupPath -ArgumentList """$PSScriptRoot\task-tracker-installer.iss""" -Wait

# Check if installer was created
$InstallerPath = "$PSScriptRoot\release\TaskTracker-Setup.exe"
if (Test-Path $InstallerPath) {
    Write-Host "Installer created successfully at: $InstallerPath" -ForegroundColor Green
    
    # Ask if user wants to run the installer
    $RunInstaller = Read-Host "Do you want to run the installer now? (Y/N)"
    if ($RunInstaller -eq "Y" -or $RunInstaller -eq "y") {
        Start-Process -FilePath $InstallerPath
    }
} else {
    Write-Host "Failed to create installer. Please check for errors." -ForegroundColor Red
    exit 1
}

Write-Host "Build process completed successfully" -ForegroundColor Green 