import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  IconButton,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  ArrowBackIos,
  ArrowForwardIos,
  Add as AddIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { useTasks, Task } from '../context/TaskContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

const TaskCalendar = () => {
  const { tasks } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTaskForm, setOpenTaskForm] = useState(false);

  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setOpenDialog(true);
  };

  const handleNewTask = (date: Date) => {
    setSelectedDate(date);
    setOpenTaskForm(true);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Create a grid with empty cells for month view
    const daysInWeek = 7;
    const firstDayOfMonth = monthStart.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Add empty cells at the beginning
    const blanks = Array.from({ length: firstDayOfMonth }, () => null);
    const allCells = [...blanks, ...days];

    // Group days into weeks
    const weeks: Array<Array<Date | null>> = [];
    let week: Array<Date | null> = [];
    
    allCells.forEach((day, index) => {
      week.push(day);
      if ((index + 1) % daysInWeek === 0 || index === allCells.length - 1) {
        weeks.push([...week]);
        week = [];
      }
    });

    return (
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={1}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <Grid item xs key={dayName} sx={{ textAlign: 'center' }}>
              <Typography fontWeight="bold">{dayName}</Typography>
            </Grid>
          ))}
        </Grid>
        
        {weeks.map((week, weekIndex) => (
          <Grid container spacing={1} key={weekIndex} sx={{ mt: 0.5 }}>
            {week.map((day, dayIndex) => (
              <Grid item xs key={dayIndex}>
                {day ? (
                  <Paper 
                    sx={{ 
                      p: 1, 
                      height: 80, 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: isToday(day) ? '#e3f2fd' : 'white',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                      }
                    }}
                    onClick={() => handleDateClick(day)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="body2" 
                        fontWeight={isToday(day) ? 'bold' : 'normal'}
                      >
                        {format(day, 'd')}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNewTask(day);
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box sx={{ overflow: 'hidden', flexGrow: 1 }}>
                      {tasks
                        .filter(task => isSameDay(new Date(task.date), day))
                        .slice(0, 2)
                        .map(task => (
                          <Box 
                            key={task.id} 
                            sx={{ 
                              backgroundColor: 
                                task.status === 'Not Started' ? '#ffebee' : 
                                task.status === 'In Progress' ? '#fff8e1' : '#e8f5e9',
                              p: 0.5,
                              mb: 0.5,
                              borderRadius: 1,
                              fontSize: '10px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {task.title}
                          </Box>
                        ))}
                      {tasks.filter(task => isSameDay(new Date(task.date), day)).length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                          {tasks.filter(task => isSameDay(new Date(task.date), day)).length - 2} more...
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ) : <Box sx={{ height: 80 }} />}
              </Grid>
            ))}
          </Grid>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Calendar
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handlePrevMonth}>
          <ArrowBackIos />
        </IconButton>
        <Typography variant="h6">
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ArrowForwardIos />
        </IconButton>
      </Box>

      {renderCalendar()}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Tasks for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
          </Typography>
          <TaskList filter={(task: Task) => 
            selectedDate ? isSameDay(new Date(task.date), selectedDate) : false
          } />
        </DialogContent>
      </Dialog>

      <Dialog open={openTaskForm} onClose={() => setOpenTaskForm(false)} maxWidth="md" fullWidth>
        <DialogContent>
          <TaskForm 
            task={selectedDate ? { 
              id: '', 
              title: '', 
              description: '', 
              date: format(selectedDate, 'yyyy-MM-dd'),
              status: 'Not Started', 
              createdAt: '' 
            } : undefined}
            onClose={() => setOpenTaskForm(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TaskCalendar; 