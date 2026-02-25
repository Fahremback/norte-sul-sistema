
// electron-preload.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Exemplo: se você quiser expor algo do processo principal de forma segura
  // getEnvVariable: (varName) => ipcRenderer.invoke('get-env-var', varName),
  // openExternalLink: (url) => ipcRenderer.send('open-external-link', url) // Exemplo se main process lida com isso
});

console.log("Electron Preload Script Loaded");
