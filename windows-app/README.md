# Task Tracker Desktop Application

A desktop task management application built with Electron.

## Features

- Create, edit, and delete tasks
- Filter tasks by status, date range, and text search
- Track task completion
- Export/import task data
- Calendar view of tasks
- Task history

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+)
- [npm](https://www.npmjs.com/) (v6+)
- [ImageMagick](https://imagemagick.org/) (for icon generation)

## Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the application:
   ```
   npm start
   ```

## Building the Application

### Prepare Icons
Generate application icons (requires ImageMagick):
```
npm run prepare-icons
```

### Create a Packaged App
Create a packaged version without an installer:
```
npm run pack
```
This will create a packaged application in the `dist` directory.

### Create a Windows Installer
Build a Windows installer (.exe):
```
npm run build
```
or
```
npm run make-installer
```
The installer will be created in the `dist` directory.

### Create a Portable Version
Create a portable version without installation:
```
npm run build-portable
```
The portable executable will be created in the `dist` directory.

## Configuration

The application configuration is stored in `package.json` in the `build` section. You can modify various aspects:

- `appId`: Application identifier
- `productName`: The name that appears in the installer
- `fileAssociations`: File types that are associated with the application

## License

MIT 