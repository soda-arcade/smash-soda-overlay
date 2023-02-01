/**
 * Smash Soda overlay
 *
 * @link       https://mickeyuk.com
 * @since      1.0.0
 */
function app() { }

/**
 * Overlay configuration
 */
app.cfg;

/**
 * Interval for the main loop.
 */
app.interval = null;

/**
 * Messages from the API.
 */
app.messages = [];

/**
 * The host guest.
 */
app.host;

/**
 * Initializes the app.
 */
app.init = function () {

    // Application loop
    app.interval = setInterval(app.update, 500);

};

/**
 * Main app loop.
 */
app.update = function () {

    // Configuration
    api.getCfg().then((data) => {

        // Update config
        if (data.updated) {

            // Store configuration
            app.cfg = data;

            // Toggle chat input
            if (app.cfg.toggle.input) {
                chat.inputEnable();
            } else {
                chat.inputDisable();
            }

            // Enable viewports
            if (app.cfg.toggle.viewports) {
                viewport.addViewports(
                    app.cfg.viewports.views,
                    app.cfg.viewports.border,
                    app.cfg.viewports.showLabel
                )
            } else {
                viewport.addViewports(0);
            }

            viewport.focus(app.cfg.viewports.focus);

        }
        // you silly silly code lurker!
        
    });

    // Get messages from Smash Soda
    api.getMessages().then((data) => {

        // Add new messages
        if (data != null && data.length > 0) {
            data.forEach((message) => {

                // Process message
                switch (message.type) {

                    case 'host': // Tell the overlay who the host is
                        app.host = message;
                        break;

                    default: // Assume it's a chat message
                        app.messages.push(message);
                        break;

                }
                
            });
        }

    });

    // Update chat
    chat.update();

};

// Start the app
app.init();