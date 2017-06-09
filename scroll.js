
let grab = false;
let history = [window.scrollY];
let point = 1;

function push(position) {
    history.push(position);
}

function release() {
    // create the new stack current point at the top
    history = history.slice(0, point).concat(history.slice(point+1), [history[point]]);
    console.log(history);
    grab = false;
}

function keyupHandler(e) {
    // console.log("keyup");
    // console.log(e);
    if (e.key === "Alt") {
        document.body.removeEventListener("keyup", keyupHandler);
        release();
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "grab") {
        console.log("message received grab");

        if (!grab) {
            document.body.addEventListener("keyup", keyupHandler);
            grab = true;
            point = history.length;
        }

        point -= 1;
        if (Math.abs(history[point] - window.scrollY) < 45) {
            point -= 1;
        }
       if (point < 0) {
            point = history.length - 1;
        }
        console.log("scrollto: " + history[point]);
        window.scroll(window.scrollX, history[point]);

    }
})


let timer;
let delay = 1000;
let anchor = window.scrollY;
let threshold = window.innerHeight*1.5;
console.log("threshold: " + threshold);
function scrollHandler(e) {
    if (grab) {
        return;
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {

        if (Math.abs(window.scrollY - anchor) > threshold) {
            let last = history.pop();
            console.log("anchor: " + anchor);
            if (Math.abs(anchor - last) > threshold) {
                history.push(last);
                history.push(anchor);
            } else {
                history.push(anchor);
            }
            history.push(window.scrollY);
        }

        // logic
        anchor = window.scrollY;
    }, delay);
}

window.addEventListener("scroll", scrollHandler);
