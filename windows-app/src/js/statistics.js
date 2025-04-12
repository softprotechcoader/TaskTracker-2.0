/**
 * Statistics class for analyzing task data and generating metrics
 */
export class Statistics {
  constructor(taskManager) {
    this.taskManager = taskManager;
  }
  
  /**
   * Get task completion statistics for a given time period
   * @param {string} period - 'day', 'week', 'month', or 'year'
   * @returns {Object} Statistics object with various metrics
   */
  getCompletionStats(period = 'week') {
    const tasks = this.taskManager.getAllTasks();
    const now = new Date();
    let startDate;
    
    // Calculate the start date based on the period
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        // Start from last Sunday
        const day = now.getDay();
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    }
    
    // Filter tasks in the time period
    const periodTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= startDate && taskDate <= now;
    });
    
    // Calculate statistics
    const totalTasks = periodTasks.length;
    const completedTasks = periodTasks.filter(task => task.status === 'Completed').length;
    const notStartedTasks = periodTasks.filter(task => task.status === 'Not Started').length;
    const inProgressTasks = periodTasks.filter(task => task.status === 'In Progress').length;
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;
    
    return {
      period,
      totalTasks,
      completedTasks,
      notStartedTasks,
      inProgressTasks,
      completionRate
    };
  }
  
  /**
   * Get data for a completion trend chart (completed tasks over time)
   * @param {string} period - 'week', 'month', or 'year' 
   * @returns {Object} Data for the chart with labels and values
   */
  getCompletionTrendData(period = 'week') {
    const tasks = this.taskManager.getAllTasks();
    const now = new Date();
    let startDate;
    let labels = [];
    let dataPoints = [];
    
    switch (period) {
      case 'week':
        // Last 7 days
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
          labels.push(this.formatDateShort(date));
          
          const dayTasks = tasks.filter(task => {
            const taskDate = new Date(task.date);
            return (
              taskDate.getDate() === date.getDate() &&
              taskDate.getMonth() === date.getMonth() &&
              taskDate.getFullYear() === date.getFullYear()
            );
          });
          
          const completed = dayTasks.filter(task => task.status === 'Completed').length;
          dataPoints.push(completed);
        }
        break;
        
      case 'month':
        // Last 4 weeks
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 27);
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + (i * 7));
          const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
          
          labels.push(`${this.formatDateShort(weekStart)} - ${this.formatDateShort(weekEnd)}`);
          
          const weekTasks = tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= weekStart && taskDate <= weekEnd;
          });
          
          const completed = weekTasks.filter(task => task.status === 'Completed').length;
          dataPoints.push(completed);
        }
        break;
        
      case 'year':
        // Last 12 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 11; i >= 0; i--) {
          const monthIndex = (now.getMonth() - i + 12) % 12;
          const year = now.getFullYear() - (now.getMonth() < i ? 1 : 0);
          
          labels.push(`${months[monthIndex]} ${year}`);
          
          const monthStart = new Date(year, monthIndex, 1);
          const monthEnd = new Date(year, monthIndex + 1, 0);
          
          const monthTasks = tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate >= monthStart && taskDate <= monthEnd;
          });
          
          const completed = monthTasks.filter(task => task.status === 'Completed').length;
          dataPoints.push(completed);
        }
        break;
    }
    
    return {
      labels,
      data: dataPoints
    };
  }
  
  /**
   * Get productivity score based on task completion
   * @returns {number} Score from 0-100
   */
  getProductivityScore() {
    // Get tasks from the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    
    const tasks = this.taskManager.getAllTasks().filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= thirtyDaysAgo && taskDate <= now;
    });
    
    if (tasks.length === 0) return 0;
    
    // Calculate completion rate with higher weight for recent tasks
    let weightedSum = 0;
    let weightSum = 0;
    
    tasks.forEach(task => {
      const taskDate = new Date(task.date);
      const daysAgo = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
      // Weight decreases with age (30 = oldest, 1 = today)
      const weight = 31 - daysAgo;
      
      weightSum += weight;
      if (task.status === 'Completed') {
        weightedSum += weight;
      }
    });
    
    const score = Math.round((weightedSum / weightSum) * 100);
    return score;
  }
  
  /**
   * Get most productive day of the week based on task completion
   * @returns {Object} Most productive day info
   */
  getMostProductiveDay() {
    const tasks = this.taskManager.getAllTasks();
    const dayStats = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
    const dayTasks = [0, 0, 0, 0, 0, 0, 0]; // Total tasks per day
    
    tasks.forEach(task => {
      const taskDate = new Date(task.date);
      const day = taskDate.getDay();
      
      dayTasks[day]++;
      if (task.status === 'Completed') {
        dayStats[day]++;
      }
    });
    
    // Calculate completion rates
    const completionRates = dayTasks.map((total, index) => 
      total > 0 ? (dayStats[index] / total) : 0
    );
    
    // Find the day with the highest completion rate
    let maxRate = 0;
    let mostProductiveDay = 0;
    
    completionRates.forEach((rate, day) => {
      if (rate > maxRate && dayTasks[day] >= 3) { // At least 3 tasks to be significant
        maxRate = rate;
        mostProductiveDay = day;
      }
    });
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      day: days[mostProductiveDay],
      completionRate: (maxRate * 100).toFixed(1),
      totalTasks: dayTasks[mostProductiveDay],
      completedTasks: dayStats[mostProductiveDay]
    };
  }
  
  /**
   * Format a date as MM/DD
   */
  formatDateShort(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  }
} 