
chrome.commands.onCommand.addListener((command) => {
    console.log("command handler: " + command);
    if (command === "scroll-prev") {
        chrome.tabs.query({
            'active': true,
            'currentWindow': true
        }, (tabs) => {
            var tab = tabs[0];
            chrome.tabs.sendMessage(tab.id, { type: 'grab' });
        });
    }
});
