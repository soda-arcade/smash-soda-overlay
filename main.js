/**
 * Import all the required Electron components
 */
const { electron, app, BrowserWindow, ipcMain, globalShortcut, Menu, Tray, nativeImage } = require('electron');

/**
 * Import all the required Node.js components
 */
const path = require('path');
const express = require("express");
const { Server } = require('ws');
const { application } = require('express');

/**
 * The main application window
 */
let mainWindow;

/**
 * The tray icon
 */
let tray = null;

// Create the websocket server
const server = new Server({ port: 9002 });

/**
 * Was a connection made to Soda?
 */
let sodaConnected = false;

/**
 * The list of messages to send to the renderer
 */
var messages = [];

/**
 * Configuration
 */
var cfg = {
  updated: false,
  toggle: {
    bar: true,
    chat: true,
    input: false,
    viewports: false,
  },
  viewports: {
    views: 4,
    border: true,
    showLabels: true,
    focus: -1,
    verticalSplit: false,
  },
  chat: {
    full: false,
    fadeTime: 10000,
  },
};

/**
 * Disable hardeware acceleration
 * if required
 */
//app.disableHardwareAcceleration();

/**
 * Creates the application window and sets it
 * to always be on top of other windows
 */
function createWindow() {

  // Create a window that fills the screen's available work area.
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
	
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true
    },
    width: width,
    height: height,
    fullscreen: true,
    transparent: true,
    frame: false,
    icon: 'img/icon.ico',
    show: false,
    skipTaskbar: true,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
    //.then(() => { mainWindow.webContents.openDevTools(); });

  // Always on top
  mainWindow.setPosition(0, 0);
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setFullScreenable(true);
  mainWindow.setMenuBarVisibility(false);
  mainWindow.maximize();
  mainWindow.show();
  mainWindow.setIgnoreMouseEvents(true);
  mainWindow.setKiosk(true);
  mainWindow.showInactive();

  mainWindow.on('blur', () => {
    mainWindow.setBackgroundColor('#00000000')
  });
  
  mainWindow.on('focus', () => {
    mainWindow.setBackgroundColor('#00000000')
  });
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

	// Create the main application window
	createWindow();

	// Register all the shortcut keys
	registerShortcuts();

  var iconPath = path.join(__dirname, '/img/icon.ico');
  let trayIcon = nativeImage.createFromPath(iconPath);  

  tray = new Tray(trayIcon);
  trayIcon = trayIcon.resize({  
    width: 16,  
    height: 16  
  });  

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', click: () => { app.quit(); } },
  ])
  tray.setToolTip('Smash Soda Overlay')
  tray.setContextMenu(contextMenu)

}).then(() => {

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	});

})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

// Listen for new connections
server.on('connection', (ws) => {
    sodaConnected = true;
    console.log('New client connected!'); 
    ws.on('close', () => {
      console.log('Client has disconnected!');
      if (sodaConnected) {
        app.quit();
      }
    });
  
    ws.on('message', (message) => {
      console.log('Received: %s', message);
      messages.push(JSON.parse(message));
    });
});

/**
 * Registers all the shortcut keys
 */
function registerShortcuts() {

	// Toggle chat window interactivity
  globalShortcut.register('CommandOrControl+Shift+C', () => {

    cfg.updated = true;

    if (cfg.toggle.input) {
      mainWindow.setIgnoreMouseEvents(true);
      cfg.toggle.input = false;
      mainWindow.blur();
      mainWindow.titleBarStyle = 'hidden';
    } else {
      mainWindow.setIgnoreMouseEvents(false);
      cfg.toggle.input = true;
      mainWindow.focus();
      mainWindow.titleBarStyle = 'hidden';
    }

	});

	// Toggle chat window visibility
	globalShortcut.register('CommandOrControl+Shift+Alt+C', () => {
    cfg.updated = true;
	});

	// Overlay opacity up
	globalShortcut.register('CommandOrControl+Shift+Up', () => {
    cfg.updated = true;
	});

	// Overlay opacity down
	globalShortcut.register('CommandOrControl+Shift+Down', () => {
    cfg.updated = true;
  });
  
  // Toggles Viewport
  globalShortcut.register('CommandOrControl+Shift+V', () => {
    cfg.updated = true;
    cfg.viewports.focus = -1;
    cfg.toggle.viewports = !cfg.toggle.viewports;
  });

  // Sets viewports to 2
  globalShortcut.register('CommandOrControl+2', () => {
    cfg.updated = true;
    cfg.viewports.views = 2;
  });

  // Sets viewports to 3
  globalShortcut.register('CommandOrControl+3', () => {
    cfg.updated = true;
    cfg.viewports.views = 3;
  });

  // Sets viewports to 4
  globalShortcut.register('CommandOrControl+4', () => {
    cfg.updated = true;
    cfg.viewports.views = 4;
  });

  // Focus on viewport 1
  globalShortcut.register('CommandOrControl+Shift+1', () => {
    cfg.updated = true;
    if (cfg.viewports.focus != 0) {
      cfg.viewports.focus = 0;
    } else {
      cfg.viewports.focus = -1;
    }
  });

  // Focus on viewport 2
  globalShortcut.register('CommandOrControl+Shift+2', () => {
    cfg.updated = true;
    if (cfg.viewports.focus != 1) {
      cfg.viewports.focus = 1;
    } else {
      cfg.viewports.focus = -1;
    }
  });
    
  // Focus on viewport 3 
  globalShortcut.register('CommandOrControl+Shift+3', () => {
    cfg.updated = true;
    if (cfg.viewports.focus != 2) {
      cfg.viewports.focus = 2;
    } else {
      cfg.viewports.focus = -1;
    }
  });

  // Focus on viewport 4
  globalShortcut.register('CommandOrControl+Shift+4', () => {
    cfg.updated = true;
    if (cfg.viewports.focus != 3) {
      cfg.viewports.focus = 3;
    } else {
      cfg.viewports.focus = -1;
    }
  });

  // Horizontal/Vertical 2 player
  globalShortcut.register('CommandOrControl+V+Left', () => {
    cfg.updated = true;
    cfg.viewports.verticalSplit = false;
  });
  globalShortcut.register('CommandOrControl+V+Right', () => { 
    cfg.updated = true;
    cfg.viewports.verticalSplit = false;
  });
  globalShortcut.register('CommandOrControl+V+Up', () => { 
    cfg.updated = true;
    cfg.viewports.verticalSplit = true;
  });
  globalShortcut.register('CommandOrControl+V+Down', () => { 
    cfg.updated = true;
    cfg.viewports.verticalSplit = true;
  });
  
}

/**
 * Makes config accessible to the renderer
 */
ipcMain.handle('getMessages', async (event, arg) => {
  if (messages.length > 0) {
    console.log('Sending messages to renderer');
    var messagesCopy = messages;
    messages = [];
    return messagesCopy;
  }
});

/**
 * Sends config to renderer
 */
ipcMain.handle('getCfg', async (event, arg) => {

  // Make copy of cfg
  var cfgCopy = JSON.parse(JSON.stringify(cfg)); 
  cfg.updated = false;

  return cfgCopy;

});

/**
 * Send a message to Soda
 */
ipcMain.handle('sendMessage', async (event, arg) => {
  console.log("Sending message to client");

  server.clients.forEach(client => {
    client.send(JSON.stringify(arg));
  });

  return true;
});