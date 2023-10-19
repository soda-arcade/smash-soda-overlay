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
            document.getElementsByClassName("viewport-row")[0].innerHTML = viewport.html(0, true) + viewport.html(1, true);
            document.getElementsByClassName("viewport-row")[1].innerHTML = viewport.html(2, true) + viewport.html(3, true);
            break;
    }

    // Add player labels for each viewport
    if (showLabel) {
        for (var i = 0; i < total; i++) {
            appBar.addSection(`viewport${i}-guest`, `viewport${i}`);
            appBar.addValue(`viewport${i}-guest`, `pad-${i}-name`, "", `P${i + 1}`);
        }
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
        <div class="viewport-bar">
            <div data-id="viewport${index}" class="bar"></div>
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
        if (index != -1) {
            viewportCols[i].style.display = "none";
        } else {
            viewportCols[i].style.display = "flex";
        }
    }

    if (index != -1) {

        document.getElementsByClassName("viewport-row")[0].style.display = "none";
        document.getElementsByClassName("viewport-row")[1].style.display = "none";
        
        // Show the viewport col class for the index
        viewportCols[index].style.display = "flex";
        document.getElementById("viewport-" + index).parentNode.style.display = "flex";
        document.getElementById("viewport-" + index).classList.add("focus");

    }

}

/**
 * Updates the viewports.
 */
viewport.update = function () {

    // Enable viewports
    if (app.cfg.toggle.viewports) {
                
        // Horizontal/Vertical 2 player split
        if (app.cfg.viewports.verticalSplit &&
            app.cfg.viewports.views == 2) {
            document.getElementById('viewports').classList.add('vertical');
        } else {
            document.getElementById('viewports').classList.remove('vertical');
        }

        viewport.addViewports(
            app.cfg.viewports.views,
            app.cfg.viewports.border,
            app.cfg.viewports.showLabel
        )

        // Focus on a viewport
        viewport.focus(app.cfg.viewports.focus);
        
    } else {
        viewport.addViewports(0);
    }

};