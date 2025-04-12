/**
 * Dashboard class for displaying task statistics and metrics
 */
export class Dashboard {
  constructor(stats, containerId) {
    this.stats = stats;
    this.container = document.getElementById(containerId);
  }
  
  /**
   * Initialize the dashboard and render all components
   */
  initialize() {
    this.renderHeader();
    this.renderDashboardGrid();
  }
  
  /**
   * Render the entire dashboard with all widgets
   */
  render() {
    // Clear previous content
    this.container.innerHTML = '';
    
    // Create dashboard header
    const header = document.createElement('div');
    header.className = 'dashboard-header';
    
    const title = document.createElement('h1');
    title.textContent = 'Task Tracker Dashboard';
    
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'refresh-btn';
    refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Refresh';
    refreshBtn.addEventListener('click', () => this.refreshData());
    
    header.appendChild(title);
    header.appendChild(refreshBtn);
    this.container.appendChild(header);
    
    // Create a grid layout for dashboard widgets
    const grid = document.createElement('div');
    grid.className = 'dashboard-grid';
    this.container.appendChild(grid);
    
    // Add widgets to the grid
    this.renderProductivityScore(grid);
    this.renderCompletionStats(grid, 'week');
    this.renderProductiveDay(grid);
    this.renderCompletionTrend(grid, 'week');
    
    // Set up event listeners for period buttons
    const periodBtns = header.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // Update active button
        periodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update stats with selected period
        const period = btn.dataset.period;
        this.updatePeriodStats(period);
      });
    });
  }
  
  /**
   * Update widgets when period changes
   * @param {string} period - 'week', 'month', or 'year'
   */
  updatePeriodStats(period) {
    // Update completion stats widget
    const statsWidget = this.container.querySelector('.completion-stats-widget');
    if (statsWidget) {
      const stats = this.stats.getCompletionStats(period);
      statsWidget.querySelector('h2').textContent = `${this.capitalizeFirst(period)} Overview`;
      statsWidget.querySelector('.completion-rate').textContent = `${stats.completionRate}%`;
      statsWidget.querySelector('.total-value').textContent = stats.totalTasks;
      statsWidget.querySelector('.completed-value').textContent = stats.completedTasks;
      statsWidget.querySelector('.progress-value').textContent = stats.inProgressTasks;
      statsWidget.querySelector('.not-started-value').textContent = stats.notStartedTasks;
    }
    
    // Update completion trend widget
    this.updateCompletionTrendChart(period);
  }
  
  /**
   * Render the productivity score widget
   * @param {HTMLElement} container - Container to append the widget
   */
  renderProductivityScore(container) {
    const score = this.stats.productivityScore;
    
    const widget = document.createElement('div');
    widget.className = 'dashboard-widget productivity-score-widget';
    
    widget.innerHTML = `
      <h2>Productivity Score</h2>
      <div class="score-circle">
        <div class="score-value">${score}</div>
      </div>
      <p class="score-label">Based on your last 30 days of activity</p>
    `;
    
    container.appendChild(widget);
    
    // Set the circle color based on the score
    const circle = widget.querySelector('.score-circle');
    if (score >= 75) {
      circle.classList.add('high-score');
    } else if (score >= 50) {
      circle.classList.add('medium-score');
    } else {
      circle.classList.add('low-score');
    }
  }
  
  /**
   * Render the completion stats widget
   * @param {HTMLElement} container - Container to append the widget
   * @param {string} period - 'week', 'month', or 'year'
   */
  renderCompletionStats(container, period) {
    const stats = this.stats.getCompletionStats(period);
    
    const widget = document.createElement('div');
    widget.className = 'dashboard-widget completion-stats-widget';
    
    widget.innerHTML = `
      <h2>${this.capitalizeFirst(period)} Overview</h2>
      <div class="completion-rate-container">
        <div class="completion-rate">${stats.completionRate}%</div>
        <div class="completion-label">Completion Rate</div>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-label">Total Tasks</div>
          <div class="stat-value total-value">${stats.totalTasks}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Completed</div>
          <div class="stat-value completed-value">${stats.completedTasks}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">In Progress</div>
          <div class="stat-value progress-value">${stats.inProgressTasks}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Not Started</div>
          <div class="stat-value not-started-value">${stats.notStartedTasks}</div>
        </div>
      </div>
    `;
    
    container.appendChild(widget);
  }
  
  /**
   * Render the most productive day widget
   * @param {HTMLElement} container - Container to append the widget
   */
  renderProductiveDay(container) {
    const dayInfo = this.stats.mostProductiveDay;
    
    const widget = document.createElement('div');
    widget.className = 'dashboard-widget productive-day-widget';
    
    widget.innerHTML = `
      <h2>Most Productive Day</h2>
      <div class="productive-day">${dayInfo.day}</div>
      <div class="productive-day-stats">
        <div class="stat-row">
          <div class="stat-label">Completion Rate:</div>
          <div class="stat-value">${dayInfo.completionRate}%</div>
        </div>
        <div class="stat-row">
          <div class="stat-label">Tasks Completed:</div>
          <div class="stat-value">${dayInfo.completedTasks} of ${dayInfo.totalTasks}</div>
        </div>
      </div>
    `;
    
    container.appendChild(widget);
  }
  
  /**
   * Render the completion trend widget with a chart
   * @param {HTMLElement} container - Container to append the widget
   * @param {string} period - 'week', 'month', or 'year'
   */
  renderCompletionTrend(container, period) {
    const widget = document.createElement('div');
    widget.className = 'dashboard-widget completion-trend-widget';
    
    widget.innerHTML = `
      <h2>Completion Trend</h2>
      <div class="chart-container">
        <canvas id="completion-trend-chart"></canvas>
      </div>
    `;
    
    container.appendChild(widget);
    
    // Create the chart (using chart.js or other library)
    // This is a placeholder - in a real implementation, you would use a charting library
    this.createCompletionTrendChart(period);
  }
  
  /**
   * Create a chart for completion trends
   * @param {string} period - 'week', 'month', or 'year'
   */
  createCompletionTrendChart(period) {
    // Get the chart data
    const chartData = this.stats.getCompletionTrendData(period);
    
    // For a real implementation, you would use a charting library like Chart.js
    // This is a placeholder implementation that creates a simple visual representation
    const canvas = document.getElementById('completion-trend-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Store the chart data for later updates
    this.chartData = chartData;
    
    // Draw a simple bar chart
    this.drawSimpleBarChart(ctx, chartData.labels, chartData.data);
  }
  
  /**
   * Update the completion trend chart when period changes
   * @param {string} period - 'week', 'month', or 'year'
   */
  updateCompletionTrendChart(period) {
    // Get the new chart data
    const chartData = this.stats.getCompletionTrendData(period);
    
    // Update chart
    const canvas = document.getElementById('completion-trend-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear previous chart
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw updated chart
    this.chartData = chartData;
    this.drawSimpleBarChart(ctx, chartData.labels, chartData.data);
  }
  
  /**
   * Draw a simple bar chart on the canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Array} labels - Labels for the x-axis
   * @param {Array} data - Data points for the bars
   */
  drawSimpleBarChart(ctx, labels, data) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Set canvas size
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = 200;
    
    // Calculate the maximum data value for scaling
    const maxData = Math.max(...data, 5); // Minimum of 5 to avoid empty charts
    
    // Bar properties
    const barCount = data.length;
    const padding = 40;
    const barWidth = (canvas.width - padding * 2) / barCount - 10;
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(padding, 20);
    ctx.lineTo(padding, canvas.height - 40);
    ctx.lineTo(canvas.width - padding, canvas.height - 40);
    ctx.strokeStyle = '#ccc';
    ctx.stroke();
    
    // Draw bars and labels
    for (let i = 0; i < barCount; i++) {
      const x = padding + i * (barWidth + 10) + 5;
      const barHeight = (data[i] / maxData) * (canvas.height - 70);
      const y = canvas.height - 40 - barHeight;
      
      // Draw the bar
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Draw the value
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data[i].toString(), x + barWidth / 2, y - 5);
      
      // Draw the label
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      // Shorten long labels if needed
      let label = labels[i];
      if (label.length > 8) {
        label = label.substring(0, 6) + '...';
      }
      
      ctx.fillText(label, x + barWidth / 2, canvas.height - 20);
    }
  }
  
  /**
   * Capitalize the first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  refreshData() {
    // In a real application, this would fetch fresh data from the server
    alert('In a real application, this would refresh the dashboard data from the server.');
    
    // For demonstration, we'll just clear and re-render
    this.container.innerHTML = '';
    this.initialize();
  }
} 