import { app, ipcRenderer, contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    send: (channel: string, data: any) => {
        ipcRenderer.send(channel, data);
    },
    on: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.on(channel, listener);
    },
    removeListener: (channel: string, listener: (...args: any[]) => void) => {
        ipcRenderer.removeListener(channel, listener);
    },
    removeAllListeners: (channel: string) => {
        ipcRenderer.removeAllListeners(channel);
    },
    focus: () => ipcRenderer.send('focus'),
    blur: () => ipcRenderer.send('blur'),
    chat: (data: any) => ipcRenderer.send('chat', data),
});