document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('extract-btn').addEventListener('click', function() {
        const jobUrl = document.getElementById('job-url').value.trim();
        if (jobUrl) {
            // Wrap sendMessage in a promise to handle asynchronous response
            sendMessageToBackground({ action: "extractJobDetails", jobUrl: jobUrl })
            .then(response => {
                // Process and display extracted job details
                if (response && response.data) {
                    console.log('Extracted job details:', response.data);
                    // Here you would update the UI with the extracted job details
                } else {
                    alert("Failed to extract job details.");
                }
            })
            .catch(error => {
                console.error("Error extracting job details:", error);
                alert("Failed to extract job details.");
            });
        } else {
            alert("Please enter a valid job URL.");
        }
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
