import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// API base URL
const API_URL = 'http://localhost:9000/api';

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
  status: TaskStatus;
  createdAt: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  exportTasks: (format: 'json' | 'excel') => void;
  importTasks: (file: File) => Promise<boolean>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from the API on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/tasks`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const data = await response.json();
        setTasks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks. Please try again later.');
        // Fallback to localStorage if API fails
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  // Keep localStorage as backup
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      
      const newTask = await response.json();
      setTasks(prevTasks => [...prevTasks, newTask]);
      setError(null);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
      
      // Fallback: Add task locally
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setTasks(prevTasks => [...prevTasks, newTask]);
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      const updatedTask = await response.json();
      setTasks(prevTasks => 
        prevTasks.map(task => (task.id === id ? updatedTask : task))
      );
      setError(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
      
      // Fallback: Update task locally
      setTasks(prevTasks => 
        prevTasks.map(task => (task.id === id ? { ...task, ...updates } : task))
      );
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
      
      // Fallback: Delete task locally
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  const exportTasks = (format: 'json' | 'excel') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(tasks, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `task-tracker-export-${new Date().toISOString().slice(0, 10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'excel') {
      import('exceljs').then((ExcelJS) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tasks');
        
        // Add headers
        worksheet.addRow(['ID', 'Title', 'Description', 'Date', 'Status', 'Created At']);
        
        // Add data
        tasks.forEach(task => {
          worksheet.addRow([
            task.id,
            task.title,
            task.description,
            task.date,
            task.status,
            task.createdAt
          ]);
        });
        
        // Generate file and trigger download
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const linkElement = document.createElement('a');
          linkElement.href = url;
          linkElement.download = `task-tracker-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
          linkElement.click();
          window.URL.revokeObjectURL(url);
        });
      });
    }
  };

  const importTasks = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          const importedTasks = JSON.parse(content);
          
          // Validate that the imported data is in the correct format
          if (!Array.isArray(importedTasks)) {
            resolve(false);
            return;
          }
          
          // Send to server
          const response = await fetch(`${API_URL}/tasks/import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(importedTasks),
          });
          
          if (!response.ok) {
            throw new Error('Failed to import tasks');
          }
          
          // Refresh tasks from server
          const tasksResponse = await fetch(`${API_URL}/tasks`);
          if (tasksResponse.ok) {
            const updatedTasks = await tasksResponse.json();
            setTasks(updatedTasks);
          }
          
          setError(null);
          resolve(true);
        } catch (error) {
          console.error('Error importing tasks:', error);
          setError('Failed to import tasks. Please try again.');
          
          // Fallback: Import locally
          try {
            const content = event.target?.result as string;
            const importedTasks = JSON.parse(content);
            
            if (Array.isArray(importedTasks)) {
              setTasks(importedTasks);
              resolve(true);
              return;
            }
          } catch (err) {
            console.error('Error in fallback import:', err);
          }
          
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      loading,
      error,
      addTask, 
      updateTask, 
      deleteTask, 
      exportTasks,
      importTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}; 