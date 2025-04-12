/**
 * Task Manager class that handles all task operations
 * and interacts with the Electron API for file operations
 */
export class TaskManager {
  constructor() {
    this.tasks = [];
    this.dataFilePath = null;
  }
  
  /**
   * Initialize the TaskManager and load tasks from the default location
   */
  async initialize() {
    try {
      // Get default data path from Electron
      this.dataFilePath = await window.taskAPI.getDefaultDataPath();
      
      // Load tasks from file
      await this.loadTasks();
      
      return true;
    } catch (error) {
      console.error('Error initializing TaskManager:', error);
      throw error;
    }
  }
  
  /**
   * Load tasks from the current data file path
   */
  async loadTasks() {
    try {
      if (!this.dataFilePath) {
        throw new Error('No data file path set');
      }
      
      this.tasks = await window.taskAPI.loadTasks(this.dataFilePath);
      return true;
    } catch (error) {
      console.error('Error loading tasks:', error);
      throw error;
    }
  }
  
  /**
   * Save tasks to the current data file path
   */
  async saveTasks() {
    try {
      if (!this.dataFilePath) {
        throw new Error('No data file path set');
      }
      
      await window.taskAPI.saveTasks(this.dataFilePath, this.tasks);
      return true;
    } catch (error) {
      console.error('Error saving tasks:', error);
      throw error;
    }
  }
  
  /**
   * Get all tasks
   */
  getAllTasks() {
    return [...this.tasks];
  }
  
  /**
   * Get tasks for a specific date
   */
  getTasksForDate(dateString) {
    return this.tasks.filter(task => task.date === dateString);
  }
  
  /**
   * Get tasks within a date range
   */
  getTasksInDateRange(startDate, endDate) {
    if (!startDate && !endDate) {
      return this.getAllTasks();
    }
    
    return this.tasks.filter(task => {
      if (startDate && endDate) {
        return task.date >= startDate && task.date <= endDate;
      } else if (startDate) {
        return task.date >= startDate;
      } else {
        return task.date <= endDate;
      }
    });
  }
  
  /**
   * Get tasks by status
   */
  getTasksByStatus(status) {
    return this.tasks.filter(task => task.status === status);
  }
  
  /**
   * Add a new task
   */
  async addTask(task) {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    this.tasks.push(newTask);
    await this.saveTasks();
    return newTask;
  }
  
  /**
   * Update an existing task
   */
  async updateTask(taskId, updates) {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      ...updates
    };
    
    await this.saveTasks();
    return this.tasks[taskIndex];
  }
  
  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    this.tasks.splice(taskIndex, 1);
    await this.saveTasks();
    return true;
  }
  
  /**
   * Change the data file location
   */
  async changeDataLocation() {
    try {
      const newPath = await window.taskAPI.chooseDataLocation();
      
      if (newPath) {
        this.dataFilePath = newPath;
        await this.saveTasks();
      }
      
      return this.dataFilePath;
    } catch (error) {
      console.error('Error changing data location:', error);
      throw error;
    }
  }
  
  /**
   * Get the current data file path
   */
  getDataFilePath() {
    return this.dataFilePath;
  }
  
  /**
   * Export tasks
   */
  async exportTasks() {
    try {
      return await window.taskAPI.exportTasks(this.tasks);
    } catch (error) {
      console.error('Error exporting tasks:', error);
      throw error;
    }
  }
  
  /**
   * Import tasks
   */
  async importTasks() {
    try {
      const filePath = await window.taskAPI.chooseImportFile();
      
      if (!filePath) {
        return false;
      }
      
      const importedTasks = await window.taskAPI.importTasks(filePath);
      
      if (importedTasks) {
        this.tasks = importedTasks;
        await this.saveTasks();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error importing tasks:', error);
      throw error;
    }
  }
} 