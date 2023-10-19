/**
 * Handles all the appbar stuff.
 *
 * @link       https://mickeyuk.com
 * @since      1.0.0
 */
function appBar() { }

/**
 * Adds a section to the info bar.
 * 
 * @param {string} barId        The ID of the bar to add the section to. 
 * @param {string} sectionId    The ID of the section to add.
 */
appBar.addSection = function (barId = "", sectionId) {
    var html = `<div data-id="${sectionId}" class="bar-section"></div>`;
    document.querySelectorAll(`[data-id="${barId}"]`)[0].innerHTML += html;
}

/**
 * Removes a section from the info bar.
 * 
 * @param {string} barId       The ID of the bar to remove the section from.
 * @param {string} sectionId    The ID of the section to remove.
 */
appBar.removeSection = function (barId, sectionId) {

    document.querySelectorAll(`[data-id="${barId}"]`)[0].removeChild(document.querySelectorAll(`[data-id="${sectionId}"]`)[0]);

}

/**
 * Adds a value to a section.
 * 
 * @param {string} sectionId    The ID of the section to add the value to. 
 * @param {string} value        The value to add to the section. 
 * @param {string} label        The label for the value.
 */
appBar.addValue = function (sectionId, valueId, value, label = "") {
    var html = `
        <div data-id="${valueId}" class="bar-item">
            <div class="bar-label">${label}</div>
            <div class="bar-value">${value}</div>
        </div>
    `;
    document.querySelectorAll(`[data-id="${sectionId}"]`)[0].innerHTML += html;
}

/**
 * Modifies a value in a section.
 * 
 * @param {string} valueId    The ID of the value to modify the value in.
 * @param {*} value 
 */
appBar.modifyValue = function (valueId, value) {

    document.querySelectorAll(`[data-id="${valueId}"] .bar-value`)[0].innerHTML = value;

}

/**
 * Removes a value from a section.
 * 
 * @param {string} valueId      The ID of the value to remove.
 * @param {string} sectionId    The ID of the section to remove the value from. 
 */
appBar.removeValue = function (valueId, sectionId = "") {

    if (sectionId != "") {
        document.querySelectorAll(`[data-id="${sectionId}"]`)[0].removeChild(document.querySelectorAll(`[data-id="${valueId}"]`)[0]);
    } else {
        document.querySelectorAll(`[data-id="${valueId}"]`)[0].remove();
    }

}