const { contextBridge, ipcRenderer } = require('electron');

// Expose safe APIs to the renderer process
contextBridge.exposeInMainWorld('taskAPI', {
  // File operations
  getDefaultDataPath: () => ipcRenderer.invoke('get-default-data-path'),
  chooseDataLocation: () => ipcRenderer.invoke('choose-data-location'),
  loadTasks: (filePath) => ipcRenderer.invoke('load-tasks', filePath),
  saveTasks: (filePath, tasks) => ipcRenderer.invoke('save-tasks', filePath, tasks),
  
  // Import/Export
  exportTasks: (tasks) => ipcRenderer.invoke('export-tasks', tasks),
  importTasks: (filePath) => ipcRenderer.invoke('import-tasks', filePath),
  chooseImportFile: () => ipcRenderer.invoke('choose-import-file')
}); 