// preload.js — bridge: main pushes system idle seconds, renderer listens.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("blackhole", {
  onIdle: (cb) => ipcRenderer.on("idle", (_e, seconds) => cb(seconds)),
  onDeploy: (cb) => ipcRenderer.on("deploy", () => cb()),
  loadState: () => ipcRenderer.invoke("bh-load"),
  saveState: (activeSec) => ipcRenderer.send("bh-save", activeSec),
});
