const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = process.env.PORT || 9000; // Changed to 9000 as 8081 is already in use

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Tracker API',
      version: '1.0.0',
      description: 'A simple API for managing tasks using a JSON file as database',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./server.js'], // Path to the API docs
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Path to our JSON database file
const dbPath = path.join(__dirname, 'tasks.json');

// Helper function to ensure the database file exists
const ensureDbExists = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([], null, 2), 'utf8');
    console.log('Database file created');
  }
};

// Initialize database
ensureDbExists();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       required:
 *         - title
 *         - date
 *         - status
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the task
 *         title:
 *           type: string
 *           description: The title of the task
 *         description:
 *           type: string
 *           description: The task description
 *         date:
 *           type: string
 *           format: date
 *           description: The due date for the task
 *         status:
 *           type: string
 *           description: The status of the task
 *           enum: [Not Started, In Progress, Completed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the task was created
 *       example:
 *         id: "1625048400000"
 *         title: "Complete project"
 *         description: "Finish the task tracker project"
 *         date: "2023-07-15"
 *         status: "In Progress"
 *         createdAt: "2023-07-01T10:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: The tasks managing API
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Returns the list of all tasks
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: The list of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error
 */
app.get('/api/tasks', (req, res) => {
  try {
    const tasks = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    res.json(tasks);
  } catch (error) {
    console.error('Error reading tasks:', error);
    res.status(500).json({ error: 'Failed to read tasks' });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Not Started, In Progress, Completed]
 *     responses:
 *       201:
 *         description: The task was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       500:
 *         description: Server error
 */
app.post('/api/tasks', (req, res) => {
  try {
    const tasks = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    const newTask = {
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2), 'utf8');
    
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task by id
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Not Started, In Progress, Completed]
 *     responses:
 *       200:
 *         description: The task was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: The task was not found
 *       500:
 *         description: Server error
 */
app.put('/api/tasks/:id', (req, res) => {
  try {
    const tasks = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const id = req.params.id;
    
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...req.body
    };
    
    fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2), 'utf8');
    
    res.json(tasks[taskIndex]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Remove a task by id
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The task id
 *     responses:
 *       200:
 *         description: The task was deleted
 *       404:
 *         description: The task was not found
 *       500:
 *         description: Server error
 */
app.delete('/api/tasks/:id', (req, res) => {
  try {
    const tasks = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const id = req.params.id;
    
    const filteredTasks = tasks.filter(task => task.id !== id);
    
    if (filteredTasks.length === tasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(filteredTasks, null, 2), 'utf8');
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * @swagger
 * /api/tasks/import:
 *   post:
 *     summary: Import tasks (replace all existing tasks)
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Task'
 *     responses:
 *       200:
 *         description: Tasks imported successfully
 *       400:
 *         description: Invalid data format
 *       500:
 *         description: Server error
 */
app.post('/api/tasks/import', (req, res) => {
  try {
    const tasks = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2), 'utf8');
    
    res.json({ message: 'Tasks imported successfully', count: tasks.length });
  } catch (error) {
    console.error('Error importing tasks:', error);
    res.status(500).json({ error: 'Failed to import tasks' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
}); 