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
 * Guests in the lobby.
 */
app.guests = [];

/**
 * Gamepads connected in the lobby.
 */
app.gamepads = [];

/**
 * The host guest.
 */
app.host;

/**
 * Initializes the app.
 */
app.init = function () {

    //appBar.addSection('top', 'top-left');

    // Application loop
    app.interval = setInterval(app.update, 100);

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

            // Update viewports
            viewport.update();

        }
        // you silly silly code lurker! - Youseif
        
    });

    if (app.cfg != null) {

        // Get messages from Smash Soda
        api.getMessages().then((data) => {

            // Add new messages
            if (data != null && data.length > 0) {
                data.forEach((message) => {

                    // Process message
                    switch (message.type) {

                        case 'host': // Tell the overlay who the host is
                            app.host = message.host;
                            break;
                        
                        case 'guests': // Tell the overlay who is in the lobby
                            app.guests = message.guests;
                            break;
                        
                        case 'gamepads': // Pass gamepad data to the overlay
                            app.gamepads = message.gamepads;
                            break;
                        
                        case 'addSection': // Add a section to the overlay
                            appBar.addSection(
                                message.barId,
                                message.sectionId,
                            );
                            break;
                        
                        case 'removeSection': // Remove a section from the overlay
                            appBar.removeSection(
                                message.barId,
                                message.sectionId,
                            );
                            break;
                        
                        case 'addValue': // Add a value to a section
                            appBar.addValue(
                                message.sectionId,
                                message.valueId,
                                message.value,
                                message.label,
                            );
                            break;
                        
                        case 'modifyValue': // Modify a value in a section
                            appBar.modifyValue(
                                message.valueId,
                                message.value,
                            );
                            break;
                        
                        case 'removeValue': // Remove a value from a section
                            appBar.removeValue(
                                message.valueId,
                                message.sectionId,
                            );
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

};

// Start the app
app.init();