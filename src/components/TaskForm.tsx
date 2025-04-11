import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Paper,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { useTasks, Task, TaskStatus } from '../context/TaskContext';

interface TaskFormProps {
  task?: Task;
  onClose?: () => void;
}

const TaskForm = ({ task, onClose }: TaskFormProps) => {
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [date, setDate] = useState<Date | null>(task?.date ? new Date(task.date) : new Date());
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'Not Started');
  const [titleError, setTitleError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setTitleError(true);
      return;
    }

    const taskData = {
      title,
      description,
      date: date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      status,
    };

    if (task) {
      updateTask(task.id, taskData);
    } else {
      addTask(taskData);
    }
    
    resetForm();
    if (onClose) onClose();
  };

  const resetForm = () => {
    if (!task) {
      setTitle('');
      setDescription('');
      setDate(new Date());
      setStatus('Not Started');
    }
    setTitleError(false);
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {task ? 'Edit Task' : 'Add New Task'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError(false);
              }}
              error={titleError}
              helperText={titleError ? 'Title is required' : ''}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <DatePicker
                label="Date"
                value={date}
                onChange={(newDate) => setDate(newDate)}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" color="primary">
                {task ? 'Update Task' : 'Add Task'}
              </Button>
              <Button type="button" onClick={resetForm} variant="outlined">
                Reset
              </Button>
              {onClose && (
                <Button type="button" onClick={onClose} variant="outlined" color="secondary">
                  Cancel
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default TaskForm; 