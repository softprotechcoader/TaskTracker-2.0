import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the electronAPI interface
declare global {
  interface Window {
    electronAPI: {
      loadTasks: (filePath: string) => Promise<any[]>;
      saveTasks: (filePath: string, tasks: any[]) => Promise<boolean>;
      getDefaultDataPath: () => Promise<string>;
      chooseDataLocation: () => Promise<string | null>;
      exportTasks: (format: 'json' | 'excel', tasks: any[]) => Promise<boolean>;
    }
  }
}

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
  setDataFilePath: (path: string) => void;
  dataFilePath: string | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dataFilePath, setDataFilePath] = useState<string | null>(null);

  // Load tasks from file when the component mounts or when dataFilePath changes
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        
        // If we have a dataFilePath, use it to load tasks via IPC
        if (dataFilePath) {
          const loadedTasks = await window.electronAPI.loadTasks(dataFilePath);
          setTasks(loadedTasks);
          setError(null);
        } else {
          // Use the default location or show dialog to select location
          const defaultLocation = await window.electronAPI.getDefaultDataPath();
          setDataFilePath(defaultLocation);
          
          const loadedTasks = await window.electronAPI.loadTasks(defaultLocation);
          setTasks(loadedTasks);
          setError(null);
        }
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks. Please try again later.');
        
        // Fallback to localStorage
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        } else {
          setTasks([]); // Start with empty array if no data
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadTasks();
  }, [dataFilePath]);

  // Keep localStorage as backup
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  // Save tasks to file whenever tasks change
  useEffect(() => {
    const saveTasks = async () => {
      if (!loading && dataFilePath) {
        try {
          await window.electronAPI.saveTasks(dataFilePath, tasks);
        } catch (err) {
          console.error('Error saving tasks to file:', err);
          setError('Failed to save tasks to file. Your changes are saved in browser storage only.');
        }
      }
    };
    
    saveTasks();
  }, [tasks, dataFilePath, loading]);

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      // Update state first for immediate UI feedback
      setTasks(prevTasks => [...prevTasks, newTask]);
      setError(null);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    try {
      // Update task in local state
      setTasks(prevTasks => 
        prevTasks.map(task => (task.id === id ? { ...task, ...updates } : task))
      );
      setError(null);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      // Remove task from local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const exportTasks = (format: 'json' | 'excel') => {
    if (format === 'json') {
      window.electronAPI.exportTasks('json', tasks);
    } else if (format === 'excel') {
      window.electronAPI.exportTasks('excel', tasks);
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
          
          // Update tasks in state
          setTasks(importedTasks);
          setError(null);
          resolve(true);
        } catch (error) {
          console.error('Error importing tasks:', error);
          setError('Failed to import tasks. Please try again.');
          resolve(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read the file. Please try again.');
        resolve(false);
      };
      
      reader.readAsText(file);
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        exportTasks,
        importTasks,
        setDataFilePath,
        dataFilePath
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
}; 