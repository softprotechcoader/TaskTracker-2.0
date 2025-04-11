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
  CircularProgress
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import TaskForm from './TaskForm';
import { useTasks, Task, TaskStatus } from '../context/TaskContext';

interface TaskListProps {
  filter?: (task: Task) => boolean;
}

const TaskList = ({ filter }: TaskListProps) => {
  const { tasks, loading, error, deleteTask, updateTask } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const filteredTasks = filter ? tasks.filter(filter) : tasks;

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
