/**
 * UI Controller class that handles all UI interactions
 */
export class UIController {
  constructor(taskManager, taskModal, confirmModal) {
    this.taskManager = taskManager;
    this.taskModal = taskModal;
    this.confirmModal = confirmModal;
    this.editingTaskId = null;
  }
  
  /**
   * Show a specific page and hide others
   */
  showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page-container').forEach(page => {
      page.classList.add('d-none');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.remove('d-none');
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    // Map page ID to nav link ID
    const navMap = {
      'dashboard-page': 'dashboard-link',
      'calendar-page': 'calendar-link',
      'history-page': 'history-link'
    };
    
    // Set active nav link
    const navId = navMap[pageId];
    if (navId) {
      document.getElementById(navId).classList.add('active');
    }
  }
  
  /**
   * Update the task counters in the dashboard
   */
  updateTaskCounters() {
    const tasks = this.taskManager.getAllTasks();
    document.getElementById('total-tasks-count').textContent = tasks.length;
    
    const notStartedCount = this.taskManager.getTasksByStatus('Not Started').length;
    document.getElementById('not-started-count').textContent = notStartedCount;
    
    const inProgressCount = this.taskManager.getTasksByStatus('In Progress').length;
    document.getElementById('in-progress-count').textContent = inProgressCount;
    
    const completedCount = this.taskManager.getTasksByStatus('Completed').length;
    document.getElementById('completed-count').textContent = completedCount;
  }
  
  /**
   * Render all tasks in the dashboard
   */
  renderAllTasks() {
    this.renderTodayTasks();
    this.renderTasksList(this.taskManager.getAllTasks(), 'all-tasks-container');
  }
  
  /**
   * Render today's tasks in the dashboard
   */
  renderTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = this.taskManager.getTasksForDate(today);
    this.renderTasksList(todayTasks, 'today-tasks-container');
  }
  
  /**
   * Render a list of tasks in a container
   */
  renderTasksList(tasks, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (tasks.length === 0) {
      return;
    }
    
    tasks.forEach(task => {
      const taskElement = this.createTaskElement(task);
      container.appendChild(taskElement);
    });
  }
  
  /**
   * Create a task DOM element
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
      'Not Started': 'status-not-started',
      'In Progress': 'status-in-progress',
      'Completed': 'status-completed'
    };
    
    const status = document.createElement('span');
    status.className = `task-status ${statusClasses[task.status] || ''}`;
    status.textContent = task.status;
    status.addEventListener('click', () => this.cycleTaskStatus(task.id));
    
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-secondary';
    editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
    editBtn.addEventListener('click', () => this.showTaskForm(task));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.addEventListener('click', () => this.confirmDeleteTask(task.id));
    
    actions.appendChild(status);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
    
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
    
    const date = document.createElement('p');
    date.className = 'card-text text-muted';
    date.innerHTML = `<i class="bi bi-calendar"></i> ${task.date}`;
    body.appendChild(date);
    
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
  }
  
  /**
   * Cycle through task statuses
   */
  async cycleTaskStatus(taskId) {
    try {
      const task = this.taskManager.getAllTasks().find(t => t.id === taskId);
      
      if (!task) {
        return;
      }
      
      const statusOrder = ['Not Started', 'In Progress', 'Completed'];
      const currentIndex = statusOrder.indexOf(task.status);
      const nextIndex = (currentIndex + 1) % statusOrder.length;
      const newStatus = statusOrder[nextIndex];
      
      await this.taskManager.updateTask(taskId, { status: newStatus });
      this.updateTaskCounters();
      this.renderAllTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status.');
    }
  }
  
  /**
   * Show the task form modal
   */
  showTaskForm(task = null) {
    const form = document.getElementById('task-form');
    form.reset();
    
    const modalTitle = document.getElementById('task-modal-label');
    
    if (task) {
      this.editingTaskId = task.id;
      modalTitle.textContent = 'Edit Task';
      
      document.getElementById('task-id').value = task.id;
      document.getElementById('task-title').value = task.title;
      document.getElementById('task-description').value = task.description || '';
      document.getElementById('task-date').value = task.date;
      document.getElementById('task-status').value = task.status;
    } else {
      this.editingTaskId = null;
      modalTitle.textContent = 'Add New Task';
      
      document.getElementById('task-id').value = '';
      document.getElementById('task-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('task-status').value = 'Not Started';
    }
    
    this.taskModal.show();
  }
  
  /**
   * Save a task from the form
   */
  async saveTask() {
    const form = document.getElementById('task-form');
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    
    const taskData = {
      title: document.getElementById('task-title').value,
      description: document.getElementById('task-description').value,
      date: document.getElementById('task-date').value,
      status: document.getElementById('task-status').value
    };
    
    try {
      if (this.editingTaskId) {
        await this.taskManager.updateTask(this.editingTaskId, taskData);
      } else {
        await this.taskManager.addTask(taskData);
      }
      
      this.taskModal.hide();
      this.updateTaskCounters();
      this.renderAllTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task.');
    }
  }
  
  /**
   * Show confirmation modal for deleting a task
   */
  confirmDeleteTask(taskId) {
    const confirmBtn = document.getElementById('confirm-action-btn');
    
    // Remove previous event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', async () => {
      try {
        await this.taskManager.deleteTask(taskId);
        this.confirmModal.hide();
        this.updateTaskCounters();
        this.renderAllTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task.');
      }
    });
    
    this.confirmModal.show();
  }
} 