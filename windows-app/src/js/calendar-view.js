/**
 * Calendar View class that handles the calendar visualization of tasks
 */
export class CalendarView {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.currentDate = new Date();
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }
  
  /**
   * Render the calendar view
   */
  render() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = '';
    
    // Create calendar controls
    const controls = this.createCalendarControls();
    container.appendChild(controls);
    
    // Create and populate calendar grid
    const calendarGrid = this.createCalendarGrid();
    container.appendChild(calendarGrid);
    
    // Populate the grid with dates and tasks
    this.populateCalendarGrid(calendarGrid);
  }
  
  /**
   * Create calendar navigation controls
   */
  createCalendarControls() {
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'calendar-controls d-flex justify-content-between align-items-center mb-4';
    
    // Previous month button
    const prevButton = document.createElement('button');
    prevButton.className = 'btn btn-outline-secondary';
    prevButton.innerHTML = '<i class="bi bi-chevron-left"></i>';
    prevButton.addEventListener('click', () => {
      this.navigateMonth(-1);
    });
    
    // Month/Year display
    const monthYearDisplay = document.createElement('h4');
    monthYearDisplay.className = 'm-0';
    monthYearDisplay.id = 'calendar-month-year';
    monthYearDisplay.textContent = this.formatMonthYear(this.currentMonth, this.currentYear);
    
    // Next month button
    const nextButton = document.createElement('button');
    nextButton.className = 'btn btn-outline-secondary';
    nextButton.innerHTML = '<i class="bi bi-chevron-right"></i>';
    nextButton.addEventListener('click', () => {
      this.navigateMonth(1);
    });
    
    // Today button
    const todayButton = document.createElement('button');
    todayButton.className = 'btn btn-primary';
    todayButton.textContent = 'Today';
    todayButton.addEventListener('click', () => {
      const today = new Date();
      this.currentMonth = today.getMonth();
      this.currentYear = today.getFullYear();
      this.render();
    });
    
    const leftControls = document.createElement('div');
    leftControls.appendChild(prevButton);
    leftControls.appendChild(monthYearDisplay);
    leftControls.appendChild(nextButton);
    
    controlsDiv.appendChild(leftControls);
    controlsDiv.appendChild(todayButton);
    
    return controlsDiv;
  }
  
  /**
   * Create the calendar grid structure
   */
  createCalendarGrid() {
    const calendarGrid = document.createElement('div');
    calendarGrid.className = 'calendar-grid';
    
    // Create header row with day names
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const headerRow = document.createElement('div');
    headerRow.className = 'calendar-row';
    
    daysOfWeek.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-header';
      dayHeader.textContent = day;
      headerRow.appendChild(dayHeader);
    });
    
    calendarGrid.appendChild(headerRow);
    
    // Create rows for the dates (6 weeks maximum)
    for (let i = 0; i < 6; i++) {
      const row = document.createElement('div');
      row.className = 'calendar-row';
      row.dataset.row = i;
      calendarGrid.appendChild(row);
    }
    
    return calendarGrid;
  }
  
  /**
   * Populate the calendar grid with dates and tasks
   */
  populateCalendarGrid(calendarGrid) {
    // Get the first day of the month
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Get the last day of the month
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get the last day of the previous month
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0);
    const prevMonthDays = prevMonthLastDay.getDate();
    
    // Get all rows except the header
    const rows = calendarGrid.querySelectorAll('.calendar-row:not(:first-child)');
    
    // Current date for highlighting today
    const today = new Date();
    const isCurrentMonth = (this.currentMonth === today.getMonth() && this.currentYear === today.getFullYear());
    
    let date = 1;
    let nextMonthDate = 1;
    
    // Loop through each week row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      row.innerHTML = '';
      
      // Create 7 cells for each day of the week
      for (let j = 0; j < 7; j++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        
        // Fill in previous month's dates
        if (i === 0 && j < startingDay) {
          const prevDate = prevMonthDays - startingDay + j + 1;
          cell.textContent = prevDate;
          cell.classList.add('text-muted');
          cell.dataset.date = `${this.currentYear}-${this.padZero(this.currentMonth)}-${this.padZero(prevDate)}`;
          cell.dataset.isPrevMonth = 'true';
        }
        // Fill in next month's dates
        else if (date > daysInMonth) {
          cell.textContent = nextMonthDate;
          cell.classList.add('text-muted');
          const nextMonth = this.currentMonth + 1 > 11 ? 0 : this.currentMonth + 1;
          const nextYear = this.currentMonth + 1 > 11 ? this.currentYear + 1 : this.currentYear;
          cell.dataset.date = `${nextYear}-${this.padZero(nextMonth + 1)}-${this.padZero(nextMonthDate)}`;
          cell.dataset.isNextMonth = 'true';
          nextMonthDate++;
        }
        // Fill in current month's dates
        else {
          cell.textContent = date;
          cell.dataset.date = `${this.currentYear}-${this.padZero(this.currentMonth + 1)}-${this.padZero(date)}`;
          cell.dataset.isCurrentMonth = 'true';
          
          // Highlight today
          if (isCurrentMonth && date === today.getDate()) {
            cell.classList.add('today');
          }
          
          date++;
        }
        
        // Add tasks for this date
        this.addTasksToCell(cell);
        
        row.appendChild(cell);
      }
      
      // Break if we've gone through all dates
      if (date > daysInMonth && i > 3) {
        break;
      }
    }
  }
  
  /**
   * Add tasks to a calendar cell
   */
  addTasksToCell(cell) {
    const dateString = cell.dataset.date;
    const tasks = this.taskManager.getTasksForDate(dateString);
    
    if (tasks.length === 0) {
      return;
    }
    
    const tasksContainer = document.createElement('div');
    tasksContainer.className = 'calendar-tasks';
    
    tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.className = 'calendar-task';
      
      // Color based on status
      const statusClasses = {
        'Not Started': 'calendar-task-not-started',
        'In Progress': 'calendar-task-in-progress',
        'Completed': 'calendar-task-completed'
      };
      
      taskElement.classList.add(statusClasses[task.status] || '');
      taskElement.textContent = task.title;
      
      taskElement.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showTaskDetails(task);
      });
      
      tasksContainer.appendChild(taskElement);
    });
    
    cell.appendChild(tasksContainer);
  }
  
  /**
   * Navigate to the previous or next month
   */
  navigateMonth(direction) {
    this.currentMonth += direction;
    
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    
    this.render();
  }
  
  /**
   * Format month and year for display
   */
  formatMonthYear(month, year) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${monthNames[month]} ${year}`;
  }
  
  /**
   * Pad a number with zeros
   */
  padZero(num) {
    return num.toString().padStart(2, '0');
  }
  
  /**
   * Show task details in a popup
   */
  showTaskDetails(task) {
    // Create a bootstrap modal on-the-fly
    const modalId = 'task-details-modal';
    
    // Remove existing modal if present
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      existingModal.remove();
    }
    
    // Create modal structure
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = modalId;
    modal.tabIndex = -1;
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${task.title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${task.description ? `<p>${task.description}</p>` : '<p><em>No description</em></p>'}
            <div class="mt-3">
              <strong>Date:</strong> ${task.date}
            </div>
            <div class="mt-2">
              <strong>Status:</strong> 
              <span class="badge ${this.getStatusBadgeClass(task.status)}">${task.status}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Use bootstrap from the window object
    const modalInstance = new window.bootstrap.Modal(modal);
    modalInstance.show();
  }
  
  /**
   * Get Bootstrap badge class for a task status
   */
  getStatusBadgeClass(status) {
    switch (status) {
      case 'Not Started':
        return 'bg-danger';
      case 'In Progress':
        return 'bg-warning text-dark';
      case 'Completed':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
} 