const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isElectron: true,
  platform: process.platform,
  openFile: (options) => ipcRenderer.invoke("dialog:openFile", options),
  openOutputDir: () => ipcRenderer.invoke("shell:openOutputDir"),
  scanPlugins: (extraDirs) => ipcRenderer.invoke("plugins:scan", extraDirs),
});
