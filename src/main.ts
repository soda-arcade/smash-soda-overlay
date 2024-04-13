import { createApp } from 'vue';
import App from '@/App.vue';
import Config from '@/models/Config';
import '@/css/main.css';

// Event bus
import mitt from 'mitt';
window.$eventBus = mitt();

window.electron.on('config:data', (event, data) => {

  // Might not be fancy way of doing this...but it'll do! :)
  window.$config = data as Config;
  createApp(App).mount('#app');

});

// Socket
window.electron.on('socket:ready', () => {
  window.$eventBus.emit('socket:ready');
});
window.electron.on('socket:message', (event, data) => {
  const eventData = data;
  window.$eventBus.emit(eventData.event, eventData.data);
});
window.$eventBus.on('config:update', (data) => {
  window.$config = data as Config;
});

// Shortcut keys
window.electron.on('opacity:increase', () => {
  window.$eventBus.emit('opacity:increase');
});
window.electron.on('opacity:decrease', () => {
  window.$eventBus.emit('opacity:decrease');
});
window.electron.on('chat:input', () => {
  window.$eventBus.emit('chat:input');
});
window.electron.on('chat:toggle', () => {
  window.$eventBus.emit('chat:toggle');
});
window.electron.on('gamepads:toggle', () => {
  window.$eventBus.emit('gamepads:toggle');
});
window.electron.on('guests:toggle', () => {
  window.$eventBus.emit('guests:toggle');
});
