const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Global references to prevent garbage collection
let mainWindow;
const DEFAULT_DATA_FILENAME = 'task-tracker-data.json';

// Creates the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Task Tracker',
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
    webPreferences: {
      nodeIntegration: false, 
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Load the main HTML file
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  // Remove the menu bar
  mainWindow.setMenu(null);
  
  // Clean up resources when window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Get default location for task data file (in Documents folder)
function getDefaultDataPath() {
  const documentsPath = app.getPath('documents');
  return path.join(documentsPath, 'TaskTracker', DEFAULT_DATA_FILENAME);
}

// Make sure directory exists for task data file
function ensureDirectoryExists(filePath) {
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Load tasks from a JSON file
async function loadTasks(filePath) {
  try {
    // Create default file if it doesn't exist
    if (!fs.existsSync(filePath)) {
      ensureDirectoryExists(filePath);
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading tasks:', error);
    throw error;
  }
}

// Save tasks to a JSON file
async function saveTasks(filePath, tasks) {
  try {
    ensureDirectoryExists(filePath);
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving tasks:', error);
    throw error;
  }
}

// Export tasks to a file (only JSON for simplicity)
async function exportTasks(format, tasks) {
  try {
    const options = {
      title: 'Export Tasks',
      defaultPath: app.getPath('documents') + 
        `/TaskTracker-Export-${new Date().toISOString().slice(0, 10)}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    };
    
    const { filePath } = await dialog.showSaveDialog(mainWindow, options);
    if (!filePath) return; // User cancelled
    
    fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error exporting tasks:', error);
    dialog.showErrorBox('Export Error', `Failed to export tasks: ${error.message}`);
    return false;
  }
}

// Import tasks from a file
async function importTasks(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const data = fs.readFileSync(filePath, 'utf8');
    const importedTasks = JSON.parse(data);
    
    if (!Array.isArray(importedTasks)) {
      throw new Error('Invalid task data: Not an array');
    }
    
    return importedTasks;
  } catch (error) {
    console.error('Error importing tasks:', error);
    dialog.showErrorBox('Import Error', `Failed to import tasks: ${error.message}`);
    return null;
  }
}

// Set up IPC handlers for file operations
function setupIpcHandlers() {
  // Get default data path
  ipcMain.handle('get-default-data-path', async () => {
    return getDefaultDataPath();
  });
  
  // Choose data file location
  ipcMain.handle('choose-data-location', async () => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Select Location to Save Task Data',
      defaultPath: getDefaultDataPath(),
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    
    return filePath || null;
  });
  
  // Load tasks from file
  ipcMain.handle('load-tasks', async (event, filePath) => {
    return await loadTasks(filePath);
  });
  
  // Save tasks to file
  ipcMain.handle('save-tasks', async (event, filePath, tasks) => {
    await saveTasks(filePath, tasks);
    return true;
  });
  
  // Export tasks to file
  ipcMain.handle('export-tasks', async (event, tasks) => {
    return await exportTasks('json', tasks);
  });
  
  // Import tasks from file
  ipcMain.handle('import-tasks', async (event, filePath) => {
    return await importTasks(filePath);
  });
  
  // Choose file for import
  ipcMain.handle('choose-import-file', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Select File to Import',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile']
    });
    
    return filePaths && filePaths.length > 0 ? filePaths[0] : null;
  });
}

// Initialize when Electron is ready
app.whenReady().then(() => {
  console.log('Application started');
  
  // Set up IPC handlers
  setupIpcHandlers();
  
  // Create the window
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 