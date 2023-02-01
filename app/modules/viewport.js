/**
 * Handles all the viewport stuff.
 *
 * @link       https://mickeyuk.com
 * @since      1.0.0
 */
function viewport() { }

/**
 * Adds all the viewports to the DOM.
 * 
 * @param {number} total            The total number of viewports to add.
 * @param {bool} showBorder         Whether to show the border around the viewports. 
 * @param {bool} showLabel          Whether to show the label on the viewports.
 * @param {number} gap              The gap between the viewports.
 * @param {number} margin           The margin around the viewports.
 */
viewport.addViewports = function (total, showBorder = true, showLabel = true, gap = 0, margin = 0) {

    document.getElementsByClassName("viewport-row")[0].innerHTML = "";
    document.getElementsByClassName("viewport-row")[1].innerHTML = "";
    document.getElementsByClassName("viewport-row")[0].style.display = "flex";
    document.getElementsByClassName("viewport-row")[1].style.display = "flex";

    switch (total) {
        
        case 1:
            document.getElementsByClassName("viewport-row")[0].innerHTML = viewport.html(0, true, true);
            document.getElementsByClassName("viewport-row")[1].style.display = "none";
            break;
        case 2:
            document.getElementsByClassName("viewport-row")[0].innerHTML = viewport.html(0, true, true);
            document.getElementsByClassName("viewport-row")[1].innerHTML = viewport.html(1, true, true);
            break;
        case 3:
            document.getElementsByClassName("viewport-row")[0].innerHTML = viewport.html(0, true) + viewport.html(1, true);
            document.getElementsByClassName("viewport-row")[1].innerHTML = viewport.html(2, true);
            break;
        case 4:
            document.getElementsByClassName("viewport-row")[0].innerHTML = viewport.html(0, (margin || gap)) + viewport.html(1, (margin || gap));
            document.getElementsByClassName("viewport-row")[1].innerHTML = viewport.html(2, (margin || gap)) + viewport.html(3, (margin || gap));
            break;
    }

    var viewports = document.getElementById("viewports");
    if (!showBorder) viewports.classList.add("no-border");
    if (!showLabel) viewports.classList.add("no-label");

    if (margin) viewport.setMargin(margin);
    if (gap) viewport.setGap(gap);

}

/**
 * Returns the HTML for a viewport.
 * 
 * @param {number} index        The index of the viewport. 
 * @param {bool} gap            Whether the viewport has a gap. 
 * @param {bool} single         Whether the viewport is a single viewport. 
 * 
 * @returns {string}
 */
viewport.html = function (index, gap = false, single = false) {

    var html = `
    <div id="viewport-${index}" class="viewport-col ${(gap ? "gap" : "")} ${(single ? "single" : "")}">
        <div class="viewport-bar bar">
            <div class="bar-col" data-id="viewport${index}-section1-item1">
                <div class="bar-label">P${index+1}</div>
                <div class="bar-value">MickeyUK</div>
            </div>
        </div>
    </div>
    `;

    return html;
}

/**
 * Sets the margin around the viewports.
 * 
 * @param {number} margin    The margin to set.
 */
viewport.setMargin = function (margin) {
    document.getElementById("viewports").style.setProperty("padding", margin + "px");
}

/**
 * Sets the gap between the viewports.
 * 
 * @param {number} gap  The gap to set. 
 */
viewport.setGap = function (gap) {
    document.getElementById("viewports").style.setProperty("gap", gap + "px");
    document.getElementsByClassName("viewport-row")[0].style.setProperty("gap", gap + "px");
    document.getElementsByClassName("viewport-row")[1].style.setProperty("gap", gap + "px");
}

/**
 * Fullscreen the viewport.
 * 
 * @param {number} index    The index of the viewport to fullscreen. 
 */
viewport.focus = function (index) {
    
    // Hide all the viewport col class
    var viewportCols = document.getElementsByClassName("viewport-col");
    if (viewportCols.length == 0) return;
    for (var i = 0; i < viewportCols.length; i++) {
        viewportCols[i].style.display = "none";
    }
    document.getElementsByClassName("viewport-row")[0].style.display = "none";
    document.getElementsByClassName("viewport-row")[1].style.display = "none";
    
    // Show the viewport col class for the index
    viewportCols[index].style.display = "flex";
    document.getElementById("viewport-" + index).parentNode.style.display = "flex";
    document.getElementById("viewport-" + index).classList.add("focus");

}