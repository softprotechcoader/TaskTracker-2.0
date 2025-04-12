# Script to prepare the Electron app for packaging
Write-Host "Starting installer preparation script..." -ForegroundColor Green

# Step 1: Make sure the build directory exists
Write-Host "Checking build directory..." -ForegroundColor Cyan
if (-not (Test-Path "release/win-unpacked")) {
    Write-Host "Error: Build directory not found. Run 'npm run electron:build' first." -ForegroundColor Red
    exit 1
}

# Step 2: Ensure necessary directories exist
Write-Host "Creating necessary directories..." -ForegroundColor Cyan
New-Item -Path "release/win-unpacked/resources/app" -ItemType Directory -Force | Out-Null

# Step 3: Copy application files
Write-Host "Copying application files..." -ForegroundColor Cyan
Copy-Item -Path "build/*" -Destination "release/win-unpacked/resources/app" -Recurse -Force

# Step 4: Copy electron files
Write-Host "Copying electron files..." -ForegroundColor Cyan
Copy-Item -Path "electron/*" -Destination "release/win-unpacked/resources/app/electron" -Recurse -Force

# Step 5: Create package.json in the right places
Write-Host "Creating package.json in necessary locations..." -ForegroundColor Cyan
$packageJson = @{
    name = "task-tracker"
    version = "1.0.0"
    description = "A task tracking application for managing daily tasks"
    author = "Task Tracker Team"
    main = "electron/main.js"
    private = $true
} | ConvertTo-Json

$packageJson | Out-File -FilePath "release/win-unpacked/resources/app/package.json" -Encoding UTF8

# Step 6: Copy icon files
Write-Host "Copying icon files..." -ForegroundColor Cyan
Copy-Item -Path "public/favicon.ico" -Destination "release/win-unpacked" -Force
Copy-Item -Path "public/taskdb.ico" -Destination "release/win-unpacked" -Force

# Step 7: Run installer creation script if InnoSetup is available
Write-Host "Checking for InnoSetup..." -ForegroundColor Cyan
$innoSetupPath = "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
if (Test-Path $innoSetupPath) {
    Write-Host "Creating installer with InnoSetup..." -ForegroundColor Green
    & $innoSetupPath "task-tracker-installer.iss"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Installer created successfully!" -ForegroundColor Green
    } else {
        Write-Host "Error creating installer. Exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} else {
    Write-Host "InnoSetup not found. Skipping installer creation." -ForegroundColor Yellow
    Write-Host "To create an installer, install Inno Setup 6 and run this script again." -ForegroundColor Yellow
}

Write-Host "Installer preparation complete!" -ForegroundColor Green 