# Task Tracker Application

A task management application with React web interface and Electron desktop builds.

## Project Structure

- `src/` - React web application source code
- `windows-app/` - Electron desktop application for Windows

## Features

- Create, edit and delete tasks
- Filter tasks by status, date range, and text search
- Track task completion status
- Calendar view for visualizing tasks
- Task history
- Import and export task data

## Building the Desktop Application

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- [npm](https://www.npmjs.com/) v6 or higher
- [ImageMagick](https://imagemagick.org/) (optional, for icon generation)

### Build Methods

1. **Using the Build Script**

   Navigate to the windows-app directory and run the build batch file:
   ```
   cd windows-app
   build.bat
   ```
   Follow the prompts to choose your build type.

2. **Simple Build (No Icon Generation)**

   If you don't have ImageMagick installed, use the simple build script:
   ```
   cd windows-app
   build-simple.bat
   ```

3. **Manual Build Process**

   a. Install dependencies:
   ```
   cd windows-app
   npm install
   ```

   b. Choose a build method:
   - Development: `npm start`
   - Packaged App: `npm run pack`
   - Windows Installer: `npm run build`
   - Portable Executable: `npm run build-portable`

### Build Output

All build outputs will be placed in the `windows-app/dist` directory:

- **Packaged App**: `TaskTracker-win32-x64` folder
- **Windows Installer**: `Task-Tracker-Setup-1.0.0.exe`
- **Portable App**: `Task-Tracker-Portable-1.0.0.exe`

## Running the Web Application

For development of the web interface:

```bash
npm install
npm start
```

The application will be available at http://localhost:3000

## Features

- Create, read, update, and delete tasks
- View tasks in a dashboard with statistics
- Calendar view for task planning
- Task history with advanced filtering
- Import and export tasks (JSON and Excel formats)
- Data stored in a JSON file for persistence
- Available as both web application and standalone Windows application

## Web Application Setup

### Installation

1. Install all dependencies for both frontend and backend:
   ```
   npm run setup
   ```

2. Start both the frontend and backend concurrently:
   ```
   npm run dev
   ```

The frontend will run on port 3001 by default, and the backend on port 9000.

### API Documentation

The API documentation is available at: http://localhost:9000/api-docs

This provides a Swagger UI interface where you can explore and test all available API endpoints.

## Desktop Application

### Development

To run the desktop application in development mode:

```
npm run electron:dev
```

This will start both the React development server and Electron, allowing you to see changes in real-time.

### Building the Windows Installer

To build a standalone Windows application with a proper installer:

1. First, make sure you have the latest build:
   ```
   npm run build
   ```

2. Create the Windows application installer:
   ```
   npm run electron:build
   ```

   This will create the installer in the `release` folder as `TaskTracker-Setup.exe`.

3. Alternatively, you can use the InnoSetup script:
   ```
   powershell -ExecutionPolicy Bypass -File create-installer.ps1
   ```

4. Run the installer directly:
   ```
   .\run-installer.bat
   ```

### Using the Installer

The Windows installer provides a familiar installation experience:

1. Run the `TaskTracker-Setup.exe` file
2. Choose the installation directory (default is Program Files)
3. Select additional options:
   - Create desktop shortcut
   - Create quick launch icon
   - Create start menu shortcut
   - Associate .taskdb files with Task Tracker
   - Start Task Tracker when Windows starts
4. Complete the installation
5. Launch the application

The installer will create proper Windows registry entries, making it easy to uninstall the application later through Windows Control Panel.

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

## System Requirements

### Web Application
- Node.js 14.0 or higher
- npm 6.0 or higher
- Modern web browser (Chrome, Firefox, Edge, etc.)

### Desktop Application
- Windows 10 or higher
- 4GB RAM
- 100MB free disk space

## Troubleshooting

### Port Conflicts
If you encounter port conflicts, you can change the ports in:
- Frontend: Edit the `PORT` environment variable in the start script in `package.json`
- Backend: Edit the port in `server/server.js`

### Windows Installer Issues
If you encounter issues with the Windows installer:
1. Make sure you have administrator privileges
2. Check Windows Defender or antivirus software (they might block the installer)
3. Try the manual installation methods described above

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please open an issue on the GitHub repository. 