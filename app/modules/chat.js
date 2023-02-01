/**
 * Handles all the chat window stuff.
 *
 * @link       https://mickeyuk.com
 * @since      1.0.0
 */
function chat() { }

chat.inputEnabled = false;

/**
 * Adds a message to the chat window.
 * 
 * @param {object} guest    The guest object. 
 * @param {string} message  The message to add. 
 */
chat.addMessage = function (guest, message) {

    // Create message
    var div = document.createElement("div");
    div.classList.add("chat-message");

    var msg = "";

    switch (message.type) {
        
        case "log":
            div.classList.add("log");
            msg += `<div class="chat-message-value">${message.message}</div>`;
            break;
        
        default:
            // Truncate guest name if too long
            if (guest.name.length > 20) guest.name = guest.name.substring(0, 20) + "...";

            msg += `
                <div class="chat-message-label">${ guest.name }</div>
                <div class="chat-message-value">${ message.message }</div>
            `;
            break;

    }

    // Prepend message
    div.innerHTML = msg;
    document.getElementById("chat-messages").prepend(div);

    const timer = setTimeout(() => {
        div.classList.add("fade-out");
        div.onanimationend = function () {
            div.remove();
        };
        clearTimeout(timer);
    }, 10000);

};

/**
 * Updates the chat window.
 */
chat.update = function () {

    if (app.cfg.chat.full) {
        document.getElementById("chat-messages").classList.add("full");
    }

    if (app.messages.length > 0) {

        // Add message
        chat.addMessage(app.messages[0].guest, app.messages[0].message);

        // Remove message from array
        app.messages.shift();

    }

};

/**
 * Sends a message as the host.
 */
chat.sendMessage = function () {

    var input = document.getElementById("chat-input");
    var message = {
        type: "message",
        message: input.value
    };
    input.value = "";

    api.sendMessage(message);

};

/**
 * Enables the chat input.
 */
chat.inputEnable = function () {

    chat.inputEnabled = true;
    document.getElementById("chat-input").disabled = false;
    document.getElementById("chat-input").focus();
    document.getElementById("chat-input").focus();
    document.getElementById("chat-messages").classList.add("active");

};

/**
 * Diables the chat input.
 */
chat.inputDisable = function () {

    chat.inputEnabled = false;
    document.getElementById("chat-input").disabled = true;
    document.getElementById("chat-input").blur();
    document.getElementById("chat-messages").classList.remove("active");

};

/**
 * Ensures host can't unfocus the chat input
 * when the chat input is enabled.
 */
chat.unfocus = function () {

    document.getElementById("chat-input").focus();
    
};