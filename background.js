


let activeExtensionTabId = null; // Variable to store the active tab ID
let isFirstClick = true;
let isFirstGenerateClick = true;


chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get('isRegistered', function(data) {
        if (data.isRegistered) {
            chrome.browserAction.setPopup({ popup: "popup.html" }); // Main extension window
			chrome.storage.local.set({ 'isRegistered': false }, function() {
                        chrome.browserAction.setPopup({ popup: "start_popup.html" });
                        // Send a response back to the popup if needed
                        sendResponse({ success: true });
                    });
        } else {
            activeExtensionTabId = tab.id;
            chrome.browserAction.setPopup({ popup: "start_popup.html" }); // Registration window
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "register") {
        // Validate registration data sent from the popup
        if (validateRegistrationData(request.registrationData)) {
            // If the registration data is valid, send it to the server
            fetch('http://127.0.0.1:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request.registrationData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Set the 'isRegistered' flag to true
                    chrome.storage.local.set({ 'isRegistered': true }, function() {
                        chrome.browserAction.setPopup({ popup: "popup.html" });
                        // Send a response back to the popup if needed
                        sendResponse({ success: true });
                    });
                } else {
                    // Handle registration failure
                    sendResponse({ success: false, error: data.error });
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                sendResponse({ success: false, error: error.message });
            });
            // Return true to indicate that you wish to send a response asynchronously
            return true;
        } else {
            sendResponse({ success: false, error: "Invalid registration data" });
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    if (tabId === activeExtensionTabId) {
        chrome.storage.local.remove('isRegistered', function() {
            console.log('Reset isRegistered as the extension tab was closed');
        });
        activeExtensionTabId = null;
    }
});

// Utility function to validate the registration data
function validateRegistrationData(data) {
    const namePattern = /^[a-zA-Z ]{2,30}$/;
    const emailPattern = /^[^@]+@\w+(\.\w+)+\w$/;
    const phonePattern = /^\+[1-9]{1}0?[0-9]{3,14}$/; // International phone format
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{3,}$/;

    return namePattern.test(data.name) &&
           emailPattern.test(data.email) &&
           phonePattern.test(data.phone) &&
           passwordPattern.test(data.password);
}

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.storage.local.get('isRegistered', function(data) {
        if (data.isRegistered) {
            chrome.browserAction.setPopup({ popup: "popup.html" });
        } else {
            activeExtensionTabId = tab.id;
            chrome.browserAction.setPopup({ popup: "start_popup.html" });
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === "register") {
        if (validateRegistrationData(request.registrationData)) {
            fetch('http://127.0.0.1:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request.registrationData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    chrome.storage.local.set({ 'isRegistered': true }, function() {
                        chrome.browserAction.setPopup({ popup: "popup.html" });
                        sendResponse({ success: true });
                    });
                } else {
                    sendResponse({ success: false, error: data.error });
                }
            })
            .catch(error => {
                console.error('Error during registration:', error);
                sendResponse({ success: false, error: error.message });
            });
            return true; // Indicate that the response is sent asynchronously
        } else {
            sendResponse({ success: false, error: "Invalid registration data" });
        }
    }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    if (tabId === activeExtensionTabId) {
        chrome.storage.local.remove('isRegistered', function() {
            console.log('Reset isRegistered as the extension tab was closed');
        });
        activeExtensionTabId = null;
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkCandidateClicked") {
        // Use chrome.storage to keep track of the first click
		if (isFirstClick) {
			// It's the first click, set the popup accordingly
			isFirstClick = false;
			 // Set to the job details extraction popup if it's the first click
			chrome.browserAction.setPopup({popup: "job_extraction_popup.html"});
		} else {
		// Set to the main popup otherwise
		chrome.browserAction.setPopup({popup: "popup.html"});
		}
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "checkGenerateClicked") {
        // Use chrome.storage to keep track of the first click
		if (isFirstGenerateClick) {
			// It's the first click, set the popup accordingly
			isFirstGenerateClick = false;
			 // Set to the job details extraction popup if it's the first click
			chrome.browserAction.setPopup({popup: "job_extraction_popup.html"});
		} else {
		// Set to the main popup otherwise
		chrome.browserAction.setPopup({popup: "popup.html"});
		}
    }
});






