//job_extraction_popup.js

import { matchToJob, generateContact } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('extract-btn').addEventListener('click', function() {
       matchToJob();
    });
	
	document.getElementById('generate-btn').addEventListener('click', function() {
       generateContact();
    });
	
    const goBackBtn = document.getElementById('go-back-btn');
    if (goBackBtn) {
        goBackBtn.addEventListener('click', function() {
            window.location.href = "start_popup.html"; // Navigate back to start_popup.html or the relevant popup
        });
    }
});

// Function to wrap chrome.runtime.sendMessage in a promise
function sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, function(response) {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(response);
            }
        });
    });
}


