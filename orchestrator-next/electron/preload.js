const { contextBridge, ipcRenderer } = require("electron");

// Expose only necessary environment variables
contextBridge.exposeInMainWorld("process", {
  platform: process.platform,
  version: process.version,
  env: {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  }
});

contextBridge.exposeInMainWorld("electronAPI", {
  selectMavenProject: () => ipcRenderer.invoke("select-maven-project"),
  getFeatureTests: () => ipcRenderer.invoke("get-feature-tests"),
  runTests: (paths) => ipcRenderer.invoke("run-tests", paths),
  listDataFiles: (path) => ipcRenderer.invoke("list-data-files", path),
  readFileContent: (path) => ipcRenderer.invoke("read-file-content", path),
  openReport: (reportPath) => ipcRenderer.invoke("open-report", reportPath),
  saveCsvFile: (args) => ipcRenderer.invoke("save-csv-file", args),
  uploadFile: (args) => ipcRenderer.invoke("upload-file", args),
  downloadFile: (path) => ipcRenderer.invoke("download-file", path),
  deleteFile: (path) => ipcRenderer.invoke("delete-file", path),
  stopTestExecution: () => ipcRenderer.invoke("stop-test-execution"),
});
