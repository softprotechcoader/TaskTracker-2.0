const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC functions to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  loadTasks: (filePath) => ipcRenderer.invoke('load-tasks', filePath),
  saveTasks: (filePath, tasks) => ipcRenderer.invoke('save-tasks', filePath, tasks),
  getDefaultDataPath: () => ipcRenderer.invoke('get-default-data-path'),
  chooseDataLocation: () => ipcRenderer.invoke('choose-data-location'),
  exportTasks: (format, tasks) => ipcRenderer.invoke('export-tasks', format, tasks)
});

// Empty preload file
console.log('Preload script loaded');

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
}); 