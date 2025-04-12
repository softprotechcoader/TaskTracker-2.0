module.exports = {
  appId: "com.task-tracker.app",
  productName: "Task Tracker",
  files: [
    "build/**/*",
    "electron/**/*",
    "node_modules/exceljs/**/*"
  ],
  extraResources: [
    {
      "from": "build",
      "to": "app",
      "filter": ["**/*"]
    },
    {
      "from": "electron",
      "to": "app/electron",
      "filter": ["**/*"]
    },
    {
      "from": "node_modules/exceljs",
      "to": "node_modules/exceljs",
      "filter": ["**/*"]
    }
  ],
  directories: {
    buildResources: "public",
    output: "release"
  },
  win: {
    target: "nsis",
    fileAssociations: [
      {
        "ext": "taskdb",
        "name": "Task Tracker Database",
        "description": "Task Tracker Database File",
        "role": "Editor",
        "icon": "public/taskdb.ico"
      }
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    license: "LICENSE",
    runAfterFinish: true,
    artifactName: "TaskTracker-Setup-${version}.${ext}"
  },
  extraMetadata: {
    main: "electron/main.js"
  },
  asar: true,
  npmRebuild: true
}; 