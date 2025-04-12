// Script to update package.json for electron-builder
const fs = require('fs');
const path = require('path');

try {
  console.log('Reading package.json...');
  const packageJsonPath = path.join(__dirname, 'package.json');
  const pkg = require(packageJsonPath);
  
  console.log('Updating build configuration...');
  
  // Create or update build configuration
  pkg.build = {
    appId: 'com.tasktracker.windows',
    productName: 'Task Tracker',
    directories: {
      output: 'dist'
    },
    files: ['**/*'],
    win: {
      target: 'nsis',
      icon: 'assets/icons/icon.ico'
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true
    },
    // Disable features that might cause symlink issues
    asar: true,
    npmRebuild: false,
    buildDependenciesFromSource: true
  };
  
  // Write the updated package.json back to disk
  console.log('Writing updated package.json...');
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
  
  console.log('Successfully updated package.json for installer build');
} catch (err) {
  console.error('Error updating package.json:', err.message);
  process.exit(1);
} 