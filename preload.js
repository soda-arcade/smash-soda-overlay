// Import the necessary Electron modules
const { ipcRenderer, contextBridge } = require('electron')

// Exposed protected methods in the render process
contextBridge.exposeInMainWorld('api', {

  /**
   * Gets messages from Smash Soda
   * 
   * @returns {Promise}
   */
  getMessages: () => ipcRenderer.invoke('getMessages'),

  /**
   * Toggles the chat window interaction
   * 
   * @returns {Promise}
   */
  toggleChat: () => ipcRenderer.invoke('toggleChat'),

  /**
   * Send a message to Smash Soda
   * 
   * @returns {Promise}
   */
  sendMessage: (message) => ipcRenderer.invoke('sendMessage', message),

});