var clicks = 0;
var anchor = document.createElement('a');
var bucket = [];
var hostname;
var record = true;

function addNumber() {
    browser.browserAction.setBadgeText({
        text: (++clicks).toString()
    });
    browser.browserAction.setBadgeBackgroundColor({
        color: "green"
    });
}

function recordHttpResponse(response) {
    if (record) {
        if (response.statusCode != 404){
            response.responseHeaders.forEach(function(header) {
                if (header.name.toLowerCase() == "x-amz-request-id") {
                    anchor.href = response.url;
                    hostname = anchor.hostname;
                    if (hostname == "s3.amazonaws.com"){
                        var path = anchor.pathname.split("/")[1]; 
                        if (path=="favicon.ico"){
                            hostname = bucket[0];
                        } else {
                            hostname += "/"+path;
                        }
                    }
                    if (!bucket.includes(hostname)) {
                        addNumber();
                        bucket.push(hostname);
                    }
                }
            });
        }
    }
    return {
        responseHeaders: response.responseHeaders
    };
}

browser.webRequest.onHeadersReceived.addListener(
    recordHttpResponse, {
        urls: ["<all_urls>"]
    },
    ["responseHeaders"]
);

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.greeting == "getS3Bucket") {
        sendResponse({
            response: bucket
        });
    }
    if (request.greeting == "clear") {
        bucket = [];
        browser.browserAction.setBadgeText({
            text: null
        });
        clicks = 0;
        sendResponse({
            response: bucket
        });
    }
    if (request.greeting == "check") { 
        sendResponse({
            response: record
        });
    }
    if (request.greeting == "change") {
        if (record) {
            record = false;
        } else {
            record = true;
        }
    }
});
