import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  Grid,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { isAfter, isBefore, parseISO } from 'date-fns';
import { useTasks } from '../context/TaskContext';
import TaskList from '../components/TaskList';

const TaskHistory = () => {
  const { tasks, exportTasks } = useTasks();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleExport = (format: 'json' | 'excel') => {
    exportTasks(format);
  };

  const filteredTasks = tasks.filter((task) => {
    // Apply date range filter
    if (startDate && !isBefore(parseISO(task.date), startDate)) {
      return false;
    }
    if (endDate && !isAfter(parseISO(task.date), endDate)) {
      return false;
    }

    // Apply status filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }

    // Apply search filter
    if (
      searchTerm &&
      !task.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Sort tasks by date (newest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Task History
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => handleExport('excel')}
            sx={{ mr: 1 }}
          >
            Export to Excel
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Filter Tasks
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth margin="normal">
              <DatePicker
                label="From Date"
                value={startDate}
                onChange={(newDate) => setStartDate(newDate)}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth margin="normal">
              <DatePicker
                label="To Date"
                value={endDate}
                onChange={(newDate) => setEndDate(newDate)}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="Not Started">Not Started</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              margin="normal"
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in title or description"
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          {sortedTasks.length} tasks found
        </Typography>
      </Box>

      <TaskList filter={() => true} />
    </Box>
  );
};

export default TaskHistory; 