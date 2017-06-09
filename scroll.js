
let grab = false;

function keyupHandler(e) {
    console.log("keyup");
    console.log(e);
    if (e.key === "Alt") {
        document.body.removeEventListener("keyup", keyupHandler);
        grab = false;
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "grab") {
        console.log("message received grab");

        if (!grab) {
            document.body.addEventListener("keyup", keyupHandler);
        }
        grab = true;
    }
})
