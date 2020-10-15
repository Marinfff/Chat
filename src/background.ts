'use strict';

import {
  app, protocol, BrowserWindow, ipcMain,
} from 'electron';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';

const isDevelopment = process.env.NODE_ENV !== 'production';
let win: BrowserWindow | null;

protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow() {
  win = new BrowserWindow({
    width: 1030,
    height: 705,
    minWidth: 1030,
    minHeight: 705,
    title: 'My app',
    transparent: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    win = null;
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
app.on('ready', async () => {
  createWindow();
});

ipcMain.on('maximize', () => {
  // @ts-ignore
  if (!win.isFullScreen()) {
    // @ts-ignore
    win.maximize();
  }
});
ipcMain.on('minimize', () => {
  // @ts-ignore
  win.minimize();
});
ipcMain.on('close', () => {
  // @ts-ignore
  win.close();
});

ipcMain.on('ondragstart', (event, filePath, icon) => {
  event.sender.startDrag({
    file: filePath,
    icon
  })
})

if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
