// Import modules
import { TaskManager } from './task-manager.js';
import { UIController } from './ui-controller.js';
import { CalendarView } from './calendar-view.js';
import { HistoryView } from './history-view.js';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  console.log('App initialized');
  
  // Initialize Bootstrap components
  const taskModal = new bootstrap.Modal(document.getElementById('task-modal'));
  const confirmModal = new bootstrap.Modal(document.getElementById('confirm-modal'));
  
  // Initialize the task manager
  const taskManager = new TaskManager();
  
  // Initialize UI controller
  const ui = new UIController(taskManager, taskModal, confirmModal);
  
  // Initialize views
  const calendarView = new CalendarView(taskManager);
  const historyView = new HistoryView(taskManager);
  
  // Initialize data
  try {
    await taskManager.initialize();
    ui.updateTaskCounters();
    ui.renderAllTasks();
  } catch (error) {
    console.error('Error initializing data:', error);
    alert('Failed to load tasks. Check the console for details.');
  }
  
  // Set up navigation
  document.getElementById('dashboard-link').addEventListener('click', (e) => {
    e.preventDefault();
    ui.showPage('dashboard-page');
  });
  
  document.getElementById('calendar-link').addEventListener('click', (e) => {
    e.preventDefault();
    ui.showPage('calendar-page');
    calendarView.render();
  });
  
  document.getElementById('history-link').addEventListener('click', (e) => {
    e.preventDefault();
    ui.showPage('history-page');
    historyView.render();
  });
  
  // Set up data location UI
  document.getElementById('data-location').textContent = taskManager.getDataFilePath() || 'Not set';
  
  document.getElementById('change-location-btn').addEventListener('click', async () => {
    try {
      const newPath = await taskManager.changeDataLocation();
      if (newPath) {
        document.getElementById('data-location').textContent = newPath;
      }
    } catch (error) {
      console.error('Error changing data location:', error);
      alert('Failed to change data location.');
    }
  });
  
  // Set up import/export
  document.getElementById('import-btn').addEventListener('click', async () => {
    try {
      const success = await taskManager.importTasks();
      if (success) {
        ui.updateTaskCounters();
        ui.renderAllTasks();
        calendarView.render();
        historyView.render();
        alert('Tasks imported successfully!');
      }
    } catch (error) {
      console.error('Error importing tasks:', error);
      alert('Failed to import tasks.');
    }
  });
  
  document.getElementById('export-btn').addEventListener('click', async () => {
    try {
      const success = await taskManager.exportTasks();
      if (success) {
        alert('Tasks exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting tasks:', error);
      alert('Failed to export tasks.');
    }
  });
  
  // Set up task form
  document.getElementById('add-task-btn').addEventListener('click', () => {
    ui.showTaskForm();
  });
  
  document.getElementById('save-task-btn').addEventListener('click', () => {
    ui.saveTask();
  });
  
  // Set up filter in history view
  document.getElementById('filter-tasks-btn').addEventListener('click', () => {
    historyView.applyFilter();
  });
}); 