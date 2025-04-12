import { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Button, 
  Card,
  CardContent,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  TableChart as JsonIcon,
  GridOn as ExcelIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { Task, useTaskContext } from '../context/TaskContext';

const Dashboard = () => {
  const { tasks, loading, error, exportTasks, importTasks } = useTaskContext();
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportAnchorEl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayTasks = tasks.filter(task => task.date === todayStr);
  
  // Show API error in snackbar
  useEffect(() => {
    if (error) {
      setSnackbar({
        open: true,
        message: error,
        severity: 'error'
      });
    }
  }, [error]);

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  const handleExport = (format: 'json' | 'excel') => {
    exportTasks(format);
    handleExportClose();
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type !== 'application/json') {
      setSnackbar({
        open: true,
        message: 'Please select a JSON file',
        severity: 'error'
      });
      return;
    }

    const success = await importTasks(file);
    setSnackbar({
      open: true,
      message: success ? 'Tasks imported successfully' : 'Failed to import tasks',
      severity: success ? 'success' : 'error'
    });

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getTaskCountByStatus = (status: string) => {
    return tasks.filter(task => task.status === status).length;
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Dashboard
        </Typography>
        <Box>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileSelect}
          />
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={handleImportClick}
            sx={{ mr: 1 }}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExportClick}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Menu
            anchorEl={exportAnchorEl}
            open={exportMenuOpen}
            onClose={handleExportClose}
          >
            <MenuItem onClick={() => handleExport('json')}>
              <ListItemIcon>
                <JsonIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as JSON</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => handleExport('excel')}>
              <ListItemIcon>
                <ExcelIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Export as Excel</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="div">
                {tasks.length}
              </Typography>
              <Typography color="text.secondary">
                Total Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#ffebee' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {getTaskCountByStatus('Not Started')}
              </Typography>
              <Typography color="text.secondary">
                Not Started
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#fff8e1' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {getTaskCountByStatus('In Progress')}
              </Typography>
              <Typography color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: '#e8f5e9' }}>
            <CardContent>
              <Typography variant="h5" component="div">
                {getTaskCountByStatus('Completed')}
              </Typography>
              <Typography color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <TaskForm onClose={() => {}} />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TodayIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Today's Tasks ({todayTasks.length})
          </Typography>
        </Box>
        <TaskList filter={(task: Task) => task.date === todayStr} />
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard; 