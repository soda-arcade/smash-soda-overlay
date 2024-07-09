import { createApp } from 'vue';
import App from '@/App.vue';
import Config from '@/models/Config';
import { EventsOn, EventsEmit } from '../wailsjs/runtime/runtime';
import DOMPurify from 'dompurify';
import '@/css/main.css';

// Event bus
import mitt from 'mitt';
window.$eventBus = mitt();

// Default settings
let opacityLevel = 1;           // Opacity of the overlay
let zoomLevel = 1;              // Zoom level of the overlay
window.$designMode = false;     // Disables websocket and shows preview

/**
 * Set default settings when document is ready,
 * then create the Vue app.
 */
EventsOn('app:start', (data: any) => {

    // Set default settings
    window.$config = data.config.Overlay as Config;
    window.$designMode = data.designMode;
    
    // Set custom CSS
    const style = document.getElementById('custom-css');
    if (style) {
        style.innerHTML = DOMPurify.sanitize(data.theme);
    }
    
    // Set zoom level
    document.getElementById('app').style.zoom = `${zoomLevel}`;

    // Set opacity level
    opacityLevel = window.$config.opacity;
    document.getElementById('app').style.opacity = `${opacityLevel}`;

    // Create Vue app
    createApp(App)
    .mount('#app');

});

// On config update
EventsOn('app:config', (data: any) => {
    window.$config = data.config.Overlay as Config;
    window.$eventBus.emit('config:updated');

    const style = document.getElementById('custom-css');
    if (style) {
        style.innerHTML = DOMPurify.sanitize(data.theme);
    }
});

/**
 * Listen for hotkey events and emit them 
 * to the event bus.
 */
EventsOn('app:shortcut', (data: any) => {
    window.$eventBus.emit(data);
});

/**
 * Listen for websocket events and emit them
 * to the event bus.
 */
EventsOn('app:socket', (json: any) => {
    const data = JSON.parse(json);
    window.$eventBus.emit(data.event, data.data);
});

/**
 * Zooming in and out of the app.
 */
window.$eventBus.on('zoom:in', () => {
    zoomLevel = Math.min(1.5, zoomLevel + 0.1);
    document.getElementById('app').style.zoom = `${zoomLevel}`;
});
window.$eventBus.on('zoom:out', () => {
    zoomLevel = Math.max(0.5, zoomLevel - 0.1);
    document.getElementById('app').style.zoom = `${zoomLevel}`;
});

/**
 * Opacity of the app.
 */
window.$eventBus.on('opacity:in', () => {
    opacityLevel = Math.min(1, opacityLevel + 0.1);
    document.getElementById('app').style.opacity = `${opacityLevel}`;
});
window.$eventBus.on('opacity:out', () => {
    opacityLevel = Math.max(0.1, opacityLevel - 0.1);
    document.getElementById('app').style.opacity = `${opacityLevel}`;
});