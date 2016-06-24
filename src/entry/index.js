/**
 * Creator: yeliex
 * Project: whitestorm.js
 * Description:
 */

import electron, { app, BrowserWindow } from 'electron';

let window;

const createWindow = function createWindow() {
  window = new BrowserWindow({ width: 800, height: 600 });
  window.loadURL('http://192.241.128.187/current/examples/fps.html');
};

app.on('ready', createWindow);

app.on('window-all-closed', app.quit);
