import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import TaskCalendar from './pages/TaskCalendar';
import TaskHistory from './pages/TaskHistory';
import Layout from './components/Layout';
import { TaskProvider } from './context/TaskContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

function App() {
  return (
    <TaskProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="calendar" element={<TaskCalendar />} />
            <Route path="history" element={<TaskHistory />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </TaskProvider>
  );
}

export default App; 