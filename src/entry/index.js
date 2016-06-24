/**
 * Creator: yeliex
 * Project: whitestorm.js
 * Description:
 */

import electron, { app, BrowserWindow } from 'electron';
import {join} from 'path';

let window;

const createWindow = function createWindow() {
  window = new BrowserWindow({ width: 800, height: 600 });
  window.loadURL(`file://${join(__dirname,'../view/sky.html')}`);
  // window.loadURL('https://raw.githubusercontent.com/WhitestormJS/whitestorm.js/b22c8036f168ad7cb3e10bc5f4f52bab0651f655/examples/skybox.html');
};

app.on('ready', createWindow);

app.on('window-all-closed', app.quit);
