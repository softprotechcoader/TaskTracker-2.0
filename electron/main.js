const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Import ExcelJS dynamically when needed instead of at the top level
// This helps avoid issues during build time

let mainWindow;
const DEFAULT_DATA_FILENAME = 'task-tracker-data.json';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev()) {
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.webContents.openDevTools();
  } else {
    // Look for index.html in build directory
    const indexPath = path.join(app.getAppPath(), 'build', 'index.html');
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error('Could not find index.html');
      dialog.showErrorBox('UI Error', 'Could not find the application UI files.');
    }
    mainWindow.setMenu(null);
  }
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function isDev() {
  return process.env.NODE_ENV === 'development';
}

// Get default location for task data file
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

// Export tasks to a file (JSON or Excel)
async function exportTasks(format, tasks) {
  try {
    const options = {
      title: 'Export Tasks',
      defaultPath: app.getPath('documents') + 
        `/TaskTracker-Export-${new Date().toISOString().slice(0, 10)}.${format === 'json' ? 'json' : 'xlsx'}`,
      filters: [
        { name: format === 'json' ? 'JSON Files' : 'Excel Files', 
          extensions: [format === 'json' ? 'json' : 'xlsx'] }
      ]
    };
    
    const { filePath } = await dialog.showSaveDialog(mainWindow, options);
    if (!filePath) return; // User cancelled
    
    if (format === 'json') {
      // JSON export
      fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2), 'utf8');
    } else {
      // For Excel, we'll just save as JSON for now and show a message
      const jsonFilePath = filePath.replace('.xlsx', '.json');
      fs.writeFileSync(jsonFilePath, JSON.stringify(tasks, null, 2), 'utf8');
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Export Information',
        message: 'Excel export functionality requires additional setup. Your data has been exported as JSON instead.',
        detail: `File saved as: ${jsonFilePath}`
      });
    }
  } catch (error) {
    console.error('Error exporting tasks:', error);
    dialog.showErrorBox('Export Error', `Failed to export tasks: ${error.message}`);
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
  ipcMain.handle('export-tasks', async (event, format, tasks) => {
    await exportTasks(format, tasks);
    return true;
  });
}

app.whenReady().then(() => {
  console.log(`Application started. App path: ${app.getAppPath()}`);
  
  // Set up IPC handlers
  setupIpcHandlers();
  
  // Create the window
  createWindow();
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
}); 