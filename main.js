/**
 * Import all the required Electron components
 */
const { electron, app, BrowserWindow, ipcMain, globalShortcut } = require('electron');

/**
 * Import all the required Node.js components
 */
const path = require('path');
const express = require("express");
const { Server } = require('ws');

/**
 * The main application window
 */
let mainWindow;

// Create the websocket server
const server = new Server({ port: 9002 });

var messages = [];

var chatInputEnabled = false;

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
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
    //.then(() => { mainWindow.webContents.openDevTools(); });

  // Always on top
  mainWindow.setPosition(0, 0)
  mainWindow.setAlwaysOnTop(true, "screen-saver")
  mainWindow.setVisibleOnAllWorkspaces(true)
  mainWindow.setFullScreenable(false)
  mainWindow.setMenuBarVisibility(false)
  mainWindow.maximize()
  mainWindow.show()
  mainWindow.setIgnoreMouseEvents(true)
  mainWindow.setKiosk(true)
  mainWindow.showInactive()
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

	// Create the main application window
	createWindow();

	// Register all the shortcut keys
	registerShortcuts();

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
    console.log('New client connected!'); 
    ws.on('close', () => console.log('Client has disconnected!'));
  
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
    if (chatInputEnabled) {
      mainWindow.setIgnoreMouseEvents(true);
      chatInputEnabled = false;
      mainWindow.blur();
    } else {
      mainWindow.setIgnoreMouseEvents(false);
      chatInputEnabled = true;
      mainWindow.focus();
    }
	});

	// Toggle chat window visibility
	globalShortcut.register('CommandOrControl+Shift+Alt+C', () => {
			
	});

	// Overlay opacity up
	globalShortcut.register('CommandOrControl+Shift+Up', () => {

	});

	// Overlay opacity down
	globalShortcut.register('CommandOrControl+Shift+Down', () => {

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
 * Toggle chat window interactivity
 */
ipcMain.handle('toggleChat', async (event, arg) => {
  return chatInputEnabled;
});

/**
 * Toggle chat window interactivity
 */
ipcMain.handle('sendMessage', async (event, arg) => {
  console.log("Sending message to client");
  server.clients.forEach(client => {
    client.send(JSON.stringify(arg));
  });
  return true;
});