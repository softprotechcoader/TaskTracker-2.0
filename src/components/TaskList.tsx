import { useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogContent,
  Tooltip,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Toolbar,
  TextField,
  MenuItem,
  Stack,
  InputAdornment
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format, parseISO, isAfter, isBefore, isEqual } from 'date-fns';
import TaskForm from './TaskForm';
import { Task, TaskStatus, useTaskContext } from '../context/TaskContext';
import FileLocationIcon from '@mui/icons-material/Folder';

interface TaskListProps {
  filter?: (task: Task) => boolean;
}

const TaskList = ({ filter }: TaskListProps) => {
  const { tasks, loading, error: contextError, addTask, updateTask, deleteTask, exportTasks, importTasks, dataFilePath, setDataFilePath } = useTaskContext();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Use a combined error from context or local state
  const error = contextError || localError;

  // Apply all filters
  const applyFilters = (task: Task) => {
    // Status filter
    if (statusFilter !== 'All' && task.status !== statusFilter) {
      return false;
    }
    
    // Date range filter
    if (startDate && (isBefore(parseISO(task.date), parseISO(startDate)) && 
                     !isEqual(parseISO(task.date), parseISO(startDate)))) {
      return false;
    }
    
    if (endDate && (isAfter(parseISO(task.date), parseISO(endDate)) && 
                   !isEqual(parseISO(task.date), parseISO(endDate)))) {
      return false;
    }
    
    // Text search
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  };

  // Combine external filter with our local filters
  const filteredTasks = (filter ? tasks.filter(filter) : tasks).filter(applyFilters);

  const resetFilters = () => {
    setStatusFilter('All');
    setSearchText('');
    setStartDate('');
    setEndDate('');
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setOpenDialog(true);
  };

  const handleStatusChange = (task: Task) => {
    const statusOrder: TaskStatus[] = ['Not Started', 'In Progress', 'Completed'];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    updateTask(task.id, { status: statusOrder[nextIndex] });
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Not Started':
        return 'error';
      case 'In Progress':
        return 'warning';
      case 'Completed':
        return 'success';
      default:
        return 'default';
    }
  };

  // Function to handle changing the data file location
  const handleChangeDataLocation = async () => {
    if (window.electronAPI) {
      try {
        const newPath = await window.electronAPI.chooseDataLocation();
        if (newPath) {
          setDataFilePath(newPath);
        }
      } catch (err) {
        console.error('Error setting data location:', err);
        setLocalError('Failed to set data location');
      }
    }
  };

  // Add these handler functions after the other handlers
  const handleAddClick = () => {
    setEditingTask(null);
    setOpenDialog(true);
  };

  const handleExportClick = () => {
    exportTasks('json');
  };

  const handleImportChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const success = await importTasks(file);
    
    if (!success) {
      // You might want to show an error message here
      console.error('Failed to import tasks');
    }
    
    // Reset the file input
    event.target.value = '';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <Alert severity="info" sx={{ my: 2 }}>
        No tasks to display
      </Alert>
    );
  }

  return (
    <>
      <Box sx={{ width: '100%' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              Tasks
            </Typography>
            
            <Tooltip title="Toggle Filters">
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Change data location">
              <IconButton onClick={handleChangeDataLocation}>
                <FileLocationIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Add Task">
              <IconButton onClick={handleAddClick}>
                <AddIcon />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ display: 'flex' }}>
              <Tooltip title="Export">
                <IconButton onClick={handleExportClick}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Import">
                <IconButton component="label">
                  <input
                    hidden
                    type="file"
                    accept=".json"
                    onChange={handleImportChange}
                  />
                  <ImportIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
          
          {showFilters && (
            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                  label="Search"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchText ? (
                      <InputAdornment position="end">
                        <IconButton 
                          size="small" 
                          onClick={() => setSearchText('')}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null,
                  }}
                />
                
                <TextField
                  select
                  label="Status"
                  variant="outlined"
                  size="small"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'All')}
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Not Started">Not Started</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </TextField>
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <TextField
                  label="From Date"
                  type="date"
                  variant="outlined"
                  size="small"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  label="To Date"
                  type="date"
                  variant="outlined"
                  size="small"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                
                <IconButton 
                  color="primary" 
                  onClick={resetFilters} 
                  size="small"
                  sx={{ ml: 'auto !important' }}
                >
                  <Tooltip title="Reset Filters">
                    <ClearIcon />
                  </Tooltip>
                </IconButton>
              </Stack>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                </Typography>
              </Box>
            </Box>
          )}
          
          {dataFilePath && (
            <Box sx={{ p: 1, bgcolor: 'background.paper', display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1, fontSize: '0.75rem' }}>
                Data file: {dataFilePath}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>

      {filteredTasks.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No tasks match your filters
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTasks.map((task, index) => (
                <TableRow key={task.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography fontWeight="medium">{task.title}</Typography>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary">
                        {task.description.length > 50 
                          ? `${task.description.substring(0, 50)}...` 
                          : task.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{format(parseISO(task.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <Tooltip title="Click to change status">
                      <Chip 
                        label={task.status} 
                        color={getStatusColor(task.status) as any}
                        onClick={() => handleStatusChange(task)}
                        clickable
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      color="primary" 
                      onClick={() => handleEdit(task)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => deleteTask(task.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogContent>
          {editingTask && (
            <TaskForm
              task={editingTask}
              onClose={() => {
                setOpenDialog(false);
                setEditingTask(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskList;
