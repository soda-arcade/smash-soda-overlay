import { 
  app, 
  BrowserWindow, 
  shell, 
  ipcMain, 
  screen, 
  globalShortcut, 
  Menu, 
  Tray, 
  nativeImage 
} from 'electron';
import { release } from 'node:os';
import { join } from 'node:path';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import path from 'path';
import { data } from 'jquery';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..');
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST as string;

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
let win: BrowserWindow;
let tray: Tray | null = null;
let server: any = null;
let socket = null;

// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js');
const url = process.env.VITE_DEV_SERVER_URL as string;
const indexHtml = join(process.env.DIST, 'index.html');

/* ----------------------------------------- 
    ELECTRON
  ------------------------------------------ */

/**
 * Create the main Electron window
 */
async function createWindow() {

  // Get the screen size of the primary display
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    title: 'Smash Soda Overlay',
    icon: join(process.env.VITE_PUBLIC as any, 'images/icons/icon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: true,
      contextIsolation: true,
      devTools: false,
      backgroundThrottling: false
    },
    width: width,
    height: height,
    fullscreen: true,
    transparent: true,
    frame: false,
    show: false,
    skipTaskbar: true,
    titleBarStyle: 'hidden',
    autoHideMenuBar: true,
  }) as BrowserWindow;

  // Always on top
  win.setPosition(0, 0);
  win.setAlwaysOnTop(true, "screen-saver");
  win.setVisibleOnAllWorkspaces(true);
  win.setFullScreenable(true);
  win.setMenuBarVisibility(false);
  win.maximize();
  win.show();
  win.setIgnoreMouseEvents(true);
  win.setKiosk(true);
  win.showInactive();

  win.on('blur', () => {
    win.setBackgroundColor('#00000000');
  });
  
  win.on('focus', () => {
    win.setBackgroundColor('#00000000');
  });

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    
    win.loadURL(indexHtml, {"extraHeaders" : "pragma: no-cache\n"});
  }

  function getConfig() {
    const appDataPath = app.getPath('appData');
    const filePath = path.join(appDataPath, '/SmashSodaTwo/config.json');

    fs.promises.readFile(filePath, 'utf-8')
    .then(data => {
      const jsonData = JSON.parse(data);
      win?.webContents.send('config:data', jsonData.Overlay);
    })
    .catch(err => {
      console.error('An error occurred reading the file: ', err);
    });
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    getConfig();
  });

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  });

}

/**
 * Create the tray icon and context menu
 */
async function createTray() {
  var iconPath = join(process.env.VITE_PUBLIC as string, 'images/icons/icon.ico');
  let trayIcon = nativeImage.createFromPath(iconPath);

  tray = new Tray(trayIcon);
  trayIcon = trayIcon.resize({  
    width: 16,  
    height: 16  
  });  

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Quit', click: () => { app.quit(); } },
  ]);
  tray.setToolTip('Smash Soda Overlay');
  tray.setContextMenu(contextMenu);
}

/**
 * Register all the shortcut keys
 */
async function registerShortcuts() {

  // Increase opacity
  globalShortcut.register('CommandOrControl+Alt+Up', () => {
    win?.webContents.send('opacity:increase');
  });

  // Decrease opacity
  globalShortcut.register('CommandOrControl+Alt+Down', () => {
    win?.webContents.send('opacity:decrease');
  });
  
  // Toggle chat input
  globalShortcut.register('CommandOrControl+Shift+C', () => {
    win?.webContents.send('chat:input');
  });

  // Toggle chat visibility
  globalShortcut.register('CommandOrControl+Alt+C', () => {
    win?.webContents.send('chat:toggle');
  });

  // Toggle gamepads visibility
  globalShortcut.register('CommandOrControl+Alt+P', () => {
    win?.webContents.send('gamepads:toggle');
  });

  // Toggle Guests visibility
  globalShortcut.register('CommandOrControl+Alt+G', () => {
    win?.webContents.send('guests:toggle');
  });

}

/* ----------------------------------------- 
    SOCKET SERVER
  ------------------------------------------ */

/**
 * Create the socket server
 */
async function createServer() {

  // Create the socket server
  server = new WebSocketServer({ port: 9002 });

  // On connection
  server.on('connection', (_socket: any) => {

    // Set the socket
    socket = _socket;

    // Tell renderer the connection is successful
    win?.webContents.send('socket:ready');

    // On message event
    _socket.on('message', (data: any) => {

      // Read buffer data
      const message = data.toString();
      win?.webContents.send('socket:message', JSON.parse(message));
      
    });

    // On close event quit the app
    _socket.on('close', () => {
      app.quit();
    });

  });

  // Start connection timer
  // If the connection is not established within 30 seconds, Smash Soda
  // will try to quit app, but this is in case a user launched the app
  // without Smash Soda or if Smash Soda crashed
  setTimeout(() => {
    if (!socket) {
      app.quit();
    }
  }, 30000);

}

/* ----------------------------------------- 
    INVOKABLES
  ------------------------------------------ */

// Send chat message to Smash Soda
ipcMain.on('chat', (event: any, message: string) => {
  // If socket is not available, then return
  if (!socket) return;

  // Send message to the socket
  (socket as any).send(JSON.stringify({
    event: 'chat:message',
    data: message,
  }));

});

// Toggle focus
ipcMain.on('focus', () => {
  win?.setIgnoreMouseEvents(false);
  win?.focus();
});

// Toggle blur
ipcMain.on('blur', () => {
  win?.setIgnoreMouseEvents(true);
  win?.blur();
});

/* ----------------------------------------- 
    INITIALIZATION
  ------------------------------------------ */

// Once Electron is ready, then initialize the app
app.whenReady().then(async () => {

  // Create the socket server
  createServer();

  // Create the main window
  createWindow();

  // Create the tray icon
  createTray();

  // Register all the shortcut keys
	registerShortcuts();

});

/* ----------------------------------------- 
    EVENTS
  ------------------------------------------ */

// On window close event
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

// Only once instance of the app is allowed
app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

// On activate event
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  };
});
