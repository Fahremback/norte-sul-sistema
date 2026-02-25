
// electron-main.js
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { app, BrowserWindow, shell } = require('electron');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const url = require('url');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Habilitar webSecurity: true é mais seguro, mas pode requerer configuração de CORS no backend se ele rodar localmente.
      // Se o backend for sempre remoto (Render), manter true.
      webSecurity: true, 
    },
    icon: path.join(__dirname, 'assets', 'icon.png') // Para Linux/Mac, .ico para Windows é via electron-packager
  });

  // Carrega o index.html da build de produção do React
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    // Ajuste o caminho se seu electron-main.js estiver em uma subpasta como 'electron/'
    pathname: path.join(__dirname, 'dist/index.html'), 
    protocol: 'file:',
    slashes: true
  });
  mainWindow.loadURL(startUrl);

  // mainWindow.webContents.openDevTools(); // Abrir DevTools para depuração

  // Abrir links externos no navegador padrão
  mainWindow.webContents.setWindowOpenHandler(({ url: externalUrl }) => {
    if (externalUrl.startsWith('http:') || externalUrl.startsWith('https:')) {
      shell.openExternal(externalUrl);
    }
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Exemplo de como você poderia passar a API_KEY de forma mais segura para o renderer (opcional)
// Se você configurar uma variável de ambiente no processo de build do Electron (ex: MY_GEMINI_KEY)
// const { ipcMain } = require('electron');
// ipcMain.handle('get-env-var', (event, varName) => {
//   return process.env[varName];
// });

