const fs = require('fs');
const path = require('path');

// Define paths
const electronSrcDir = path.join(__dirname, 'electron');
const buildDir = path.join(__dirname, 'build');
const electronDestDir = path.join(buildDir, 'electron');

// Make sure build directory exists
if (!fs.existsSync(buildDir)) {
  console.error('Build directory does not exist. Run npm run build first.');
  process.exit(1);
}

// Create electron directory in build if it doesn't exist
if (!fs.existsSync(electronDestDir)) {
  fs.mkdirSync(electronDestDir, { recursive: true });
  console.log('Created electron directory in build folder');
}

// Function to copy a file
function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`Copied ${path.basename(src)} to ${dest}`);
}

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Get all files and directories in the source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  // Copy each file/directory
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      copyFile(srcPath, destPath);
    }
  }
}

// Copy electron directory to build
console.log('Copying electron directory...');
copyDir(electronSrcDir, electronDestDir);

// Create/update package.json in build directory
const packageJson = {
  name: "task-tracker",
  version: "1.0.0",
  description: "A task tracking application for managing daily tasks",
  author: "Task Tracker Team", 
  main: "electron/main.js",
  private: true
};

fs.writeFileSync(
  path.join(buildDir, 'package.json'), 
  JSON.stringify(packageJson, null, 2)
);
console.log('Created package.json in build directory');

console.log('Electron build preparation completed successfully'); 