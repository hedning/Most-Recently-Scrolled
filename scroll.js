
let grab = false;
let history = [];
let point = 1;

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
    renumberIndicators();
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
    renumberIndicators();
}

function keyupHandler(e) {
    // console.log("keyup");
    // console.log(e);
    if (e.key === "Alt") {
        document.body.removeEventListener("keyup", keyupHandler);
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
            if (Math.abs(anchor.offset - last) > threshold) {
                push(anchor.offset);
            }
            push(window.scrollY);
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

