# PowerShell script to download InnoSetup and compile the installer

$InnoSetupUrl = "https://files.jrsoftware.org/is/6/innosetup-6.2.2.exe"
$InnoSetupInstaller = "$env:TEMP\innosetup-6.2.2.exe"
$InnoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"

# Check if InnoSetup is already installed
if (-not (Test-Path $InnoSetupPath)) {
    Write-Host "InnoSetup not found. Downloading..."
    
    # Download InnoSetup
    Invoke-WebRequest -Uri $InnoSetupUrl -OutFile $InnoSetupInstaller
    
    # Install InnoSetup silently
    Write-Host "Installing InnoSetup silently..."
    Start-Process -FilePath $InnoSetupInstaller -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART" -Wait
    
    # Verify installation
    if (-not (Test-Path $InnoSetupPath)) {
        Write-Host "InnoSetup installation failed. Please install it manually from: https://jrsoftware.org/isdl.php"
        exit 1
    }
}

# Compile the installer
Write-Host "Compiling the Task Tracker installer..."
Start-Process -FilePath $InnoSetupPath -ArgumentList """$PSScriptRoot\task-tracker-installer.iss""" -Wait

# Check if installer was created
$InstallerPath = "$PSScriptRoot\release\TaskTracker-Setup.exe"
if (Test-Path $InstallerPath) {
    Write-Host "Installer created successfully at: $InstallerPath"
    
    # Ask if user wants to run the installer
    $RunInstaller = Read-Host "Do you want to run the installer now? (Y/N)"
    if ($RunInstaller -eq "Y" -or $RunInstaller -eq "y") {
        Start-Process -FilePath $InstallerPath
    }
} else {
    Write-Host "Failed to create installer. Please check for errors."
} 