
let grab = false;
let history = [];
let point = 1;

let colors = ["red", "orange", "yellow", "green", "blue"];

initIndicatorContainer();

let anchor = createPosition(window.scrollY);

anchor.indicator.style.border = "solid 1px pink"

push(window.scrollY);

function createPosition(offset) {
    return {offset: offset, indicator: createIndicator(offset)};
}

function updatePosition(position, offset) {
    position.offset = offset;
    position.indicator.style.top = ""+((offset/document.body.scrollHeight)*100)+"%";
}

function push(offset) {
    history.push(createPosition(offset));
    colorIndicators();
}

// Pops top entry and removes associated visual indicator
function pop() {
    var x = history.pop();
    x.indicator.remove();
    return x;
}

function peek() {
    return history[history.length-1];
}

function release() {
    // create the new stack current point at the top
    history = history.slice(0, point).concat(history.slice(point+1), [history[point]]);
    console.log(history);
    grab = false;
    colorIndicators();
}

function keyupHandler(e) {
    // console.log("keyup");
    // console.log(e);
    if (e.key === "Alt") {
        document.body.removeEventListener("keyup", keyupHandler);

        if (Math.abs(window.scrollY - anchor.offset) > threshold) {
            if(Math.abs(peek().offset - anchor.offset) > 50) {
                push(anchor.offset);
            }
        }

        updatePosition(anchor, history[point].offset);
        release();

    }
}

function escHandler(e) {
    if (e.key === "Escape") {
        window.scroll(window.scrollX, anchor.offset);
        grab = false;
        document.body.removeEventListener("keyup", keyupHandler);
        document.body.removeEventListener("keypress", escHandler);
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "grab") {
        console.log("message received grab");


        if (!grab) {
            document.body.addEventListener("keyup", keyupHandler);
            document.body.addEventListener("keypress", escHandler);
            grab = true;
            point = history.length;

            window.clearTimeout(timer);
            updatePosition(anchor, window.scrollY);

        }

        point = (point - 1 + history.length) % history.length;
        if (Math.abs(history[point].offset - window.scrollY) < 45) {
            point = (point - 1 + history.length) % history.length;
        }
        console.log("scrollto: " + history[point].offset);
        window.scroll(window.scrollX, history[point].offset);

    }
})


let timer;
let delay = 1000;
let threshold = window.innerHeight*1.5;
console.log("threshold: " + threshold);
function scrollHandler(e) {
    if (grab) {
        return;
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {

        if (Math.abs(window.scrollY - anchor.offset) > threshold) {
            let last = peek().offset;
            console.log("anchor: " + anchor);
            push(anchor.offset);
        }

        // logic
        updatePosition(anchor, window.scrollY);

    }, delay);
}

window.addEventListener("scroll", scrollHandler);

function renumberIndicators() {
    history.forEach((elem, i) => {
        elem.indicator.innerText = ""+(history.length-i)
    });
}

function colorIndicators() {
    let c = 0;
    for (let i=history.length - 1; i >= 0; --i) {
        let color = colors[(c + colors.length) % colors.length];
        let opacity = Math.exp(-Math.floor(c / colors.length));
        history[i].indicator.style.border = "solid 1px " + color;
        history[i].indicator.style.opacity = opacity.toString();
        history[i].indicator.style.zIndex = i+1;
        c += 1;
    }
}

function createIndicator(offset) {
    var indicator = document.createElement("div");
    indicator.classList.add("most-recently-scrolled-indicator");
    indicator.style.position = "absolute";
    indicator.style.top = ""+((offset/document.body.scrollHeight)*100)+"%";
    indicator.style.left = "0px";
    indicator.style.width = "100%";
    indicator.style.background = "yellow";
    indicator.style.border = "solid 1px black";

    indicatorContainer.appendChild(indicator);

    return indicator;
}

function initIndicatorContainer() {
    indicatorContainer = document.createElement("div")

    indicatorContainer.style.background = "transparent";
    indicatorContainer.style.position = "fixed";
    indicatorContainer.style.right = "0px"
    indicatorContainer.style.top = "0px"
    indicatorContainer.style.width = "10px";
    indicatorContainer.style.height = "100%";

    document.body.appendChild(indicatorContainer);
    
}


/**
  * Assumption: all elements have a common root offsetParent.
  */
function absoluteOffset(elem) {
    if (elem === null)
        return 0;
    return elem.offsetTop + absoluteOffset(elem.offsetParent);
}

/**
 * Assumption: Document is the scrolling container.
 */
function Marker(element, absolute_y) {
    this.set(element, absolute_y);
}

Marker.prototype.set = function set(element, absolute_y) {
    this.element = element;
    let elementHeight = element.offsetHeight;
    let viewportHeight = window.innerHeight;
    if(elementHeight === 0) {
        this.ry_e = 0;
    } else {
        this.ry_e = (absolute_y - absoluteOffset(element)) / elementHeight;
    }
    this.ry_v = (absolute_y - window.scrollY) / viewportHeight;
}

/**
 * Returns the scroll value that will position the viewport such that the marker 
 * appears at the same viewport position as when created.
 */
Marker.prototype.scrollY = function scrollY() {
    return absoluteOffset(this.element) - this.viewportOffset();
}

Marker.prototype.viewportOffset = function viewportOffset() {
    return this.ry_v * window.innerHeight
         - this.ry_e * this.element.offsetHeight;
}

Marker.prototype.absoluteOffset = function absoluteOffset() {
    return absoluteOffset(this.element) + this.ry_e * element.offsetHeight;
}


function activateResizeFollowPointer() {
    /* Attempt to keep this point stationary relative to the viewport on resize
     * and zoom */
    let focusMarker = new Marker(document.body, window.scrollY);

    window.onmousemove = function(e) {
        focusMarker.set(e.target, e.pageY);
    }

    window.onresize = function (e) {
        let focusScrollY = focusMarker.scrollY();
        // WEAKNESS: When smooth scrolling is on this scroll is visible and quite
        //           jarring
        window.scrollTo(0, focusScrollY);
    }
}

// EXPERIMENT
activateResizeFollowPointer();
