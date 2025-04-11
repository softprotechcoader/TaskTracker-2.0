# Task Tracker Application

A task management application that stores tasks in a JSON file on the server. This application allows you to create, update, and delete tasks, as well as view them in a calendar format and filter through your task history.

## Features

- Create, read, update, and delete tasks
- View tasks in a dashboard with statistics
- Calendar view for task planning
- Task history with advanced filtering
- Import and export tasks (JSON and Excel formats)
- Data stored in a JSON file for persistence

## Project Structure

- `src/` - Frontend React application
- `server/` - Backend Express server for JSON file storage

## Setup and Installation

1. Install all dependencies for both frontend and backend:
   ```
   npm run setup
   ```

2. Start both the frontend and backend concurrently:
   ```
   npm run dev
   ```

The frontend will run on port 3000 by default, and the backend on port 5000.

If you prefer to run them separately:

- Backend: `npm run server`
- Frontend: `npm start`

## How It Works

- The frontend communicates with the backend API to perform CRUD operations
- All task data is stored in a `tasks.json` file on the server
- The server reads and writes to this file for all operations
- The file is automatically created if it doesn't exist

## API Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/import` - Import tasks from JSON

## Data Persistence

All data is persisted in the `server/tasks.json` file. This file is a simple JSON array containing all task objects. Each task has the following structure:

```json
{
  "id": "1625048400000",
  "title": "Complete project",
  "description": "Finish the task tracker project",
  "date": "2023-07-15",
  "status": "In Progress",
  "createdAt": "2023-07-01T10:00:00.000Z"
}
```

## Importing and Exporting Data

- **Import**: Click the "Import" button on the dashboard and select a JSON file with task data
- **Export**: Click the "Export" button and choose between JSON or Excel formats

## Fallback Mechanism

If the server is unavailable, the application falls back to using localStorage for temporary storage, ensuring you never lose your task data. 