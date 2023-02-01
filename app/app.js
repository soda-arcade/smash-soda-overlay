/**
 * Smash Soda overlay
 *
 * @link       https://mickeyuk.github.io
 * @since      1.0.0
 */
function app() { }

/**
 * Default configuration.
 */
app.default = {

};

/**
 * Overlay configuration.
 */
app.cfg = { ...app.default };

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
    
    // Get current configuration
    // api.getCfg().then((data) => {

    //     // Update the configuration
    //     app.cfg = { ...app.cfg, ...data }; 

    // });
    
    // Application loop
    app.interval = setInterval(app.update, 500);

};

/**
 * Main app loop.
 */
app.update = function () {

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

    // Toggle chat
    api.toggleChat().then((data) => {

        if (data) {
            chat.inputEnable();
        } else {
            chat.inputDisable();
        }

    });

    // Update chat
    chat.update();

};

// Start the app
app.init();