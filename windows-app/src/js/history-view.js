/**
 * History View class that handles task history viewing and filtering
 */
export class HistoryView {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.startDate = null;
    this.endDate = null;
  }
  
  /**
   * Render the history view
   */
  render() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    this.startDate = startDateInput.value || null;
    this.endDate = endDateInput.value || null;
    
    const tasks = this.taskManager.getTasksInDateRange(this.startDate, this.endDate);
    this.renderTasksList(tasks);
  }
  
  /**
   * Apply date filters
   */
  applyFilter() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    this.startDate = startDateInput.value || null;
    this.endDate = endDateInput.value || null;
    
    this.render();
  }
  
  /**
   * Render tasks list in the history container
   */
  renderTasksList(tasks) {
    const container = document.getElementById('history-tasks-container');
    container.innerHTML = '';
    
    if (tasks.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'alert alert-info';
      emptyMessage.textContent = 'No tasks found in the selected date range.';
      container.appendChild(emptyMessage);
      return;
    }
    
    // Sort tasks by date (newest first)
    const sortedTasks = [...tasks].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    // Group tasks by date
    const tasksByDate = {};
    sortedTasks.forEach(task => {
      if (!tasksByDate[task.date]) {
        tasksByDate[task.date] = [];
      }
      tasksByDate[task.date].push(task);
    });
    
    // Create sections for each date
    Object.keys(tasksByDate).sort().reverse().forEach(date => {
      const dateSection = document.createElement('div');
      dateSection.className = 'date-section mb-4';
      
      const dateHeader = document.createElement('h5');
      dateHeader.className = 'border-bottom pb-2 mb-3';
      
      // Format date as "Day of Week, Month Day, Year"
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      dateHeader.textContent = formattedDate;
      dateSection.appendChild(dateHeader);
      
      // Add tasks for this date
      tasksByDate[date].forEach(task => {
        const taskElement = this.createTaskElement(task);
        dateSection.appendChild(taskElement);
      });
      
      container.appendChild(dateSection);
    });
  }
  
  /**
   * Create a task element
   */
  createTaskElement(task) {
    const card = document.createElement('div');
    card.className = 'card task-card';
    card.dataset.taskId = task.id;
    
    const header = document.createElement('div');
    header.className = 'card-header';
    
    const title = document.createElement('h5');
    title.className = 'card-title m-0';
    title.textContent = task.title;
    
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const statusClasses = {
      'Not Started': 'badge bg-danger',
      'In Progress': 'badge bg-warning text-dark',
      'Completed': 'badge bg-success'
    };
    
    const status = document.createElement('span');
    status.className = `${statusClasses[task.status] || 'badge bg-secondary'}`;
    status.textContent = task.status;
    
    actions.appendChild(status);
    
    header.appendChild(title);
    header.appendChild(actions);
    
    const body = document.createElement('div');
    body.className = 'card-body';
    
    if (task.description) {
      const description = document.createElement('p');
      description.className = 'card-text';
      description.textContent = task.description;
      body.appendChild(description);
    }
    
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
  }
} 