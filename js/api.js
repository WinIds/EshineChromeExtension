// api.js

// Ensure these imports are at the top of your apikey.js file
import { initializeLanguage, getMessage } from './language.js';
import { updateFollowButton, setFollowButtonState, initializeExtension } from './follow_button.js';

const HOST = "http://localhost:5017/"
const AGENT_ID = "7526152325410312"
const GOOGLE_SHEET_ID = "1RrJjy0GH-KPJurPosNLp2O5hu0_arnlgCBTAoCXmfkE"
let followedUrls = [];
let isCurrentlyFollowed = false;

function attachEventListeners() {

    document.getElementById('see-data-btn').addEventListener('click', getScrappedData);
	
    document.getElementById('follow-btn').addEventListener('click', () => {
		getCurrentTabUrl().then(url => {
			if (isValidLinkedInProfileUrl(url)) {
				isCurrentlyFollowed ? unfollowProfile() : followProfile();
			}
		})
	});
	
	document.getElementById('check-candidate-btn').addEventListener('click', function() {
    // Send message to background script to change the popup
    chrome.runtime.sendMessage({action: "checkCandidateClicked"});
	window.location.href = "job_extraction_popup.html"; // Navigate back to job_extraction_popup.html
});
}

// function followAccount() {
	
	// getCurrentTabUrl().then(url => {
		// console.log('DOM fully loaded and parsed');
		// if (isValidLinkedInProfileUrl(url)) {
			// appendLinkedInUrlToGoogleSheet(GOOGLE_SHEET_ID, url);
		// } else {
			// alert(getMessage('invalid_linkedin_url')); // Use a localized message
		// }
	// });
// }

function getScrappedData() {
    getScraperResult(`${AGENT_ID}`).then(data => {
        console.log('Scraper data:', data);
        displayScrapedData(data);
    });
}

function setIsCurrentlyFollowed(isFollowed) {
       isCurrentlyFollowed = isFollowed
}

function getIsCurrentlyFollowed() {
       return isCurrentlyFollowed;
}
			
// async function launchAgent() {
    // try {
        // const agentId = AGENT_ID; // Replace with the actual agent ID
        // const response = await fetch(`${HOST}/execute_scraper/${agentId}`);

        // if (response.ok) {
            // const data = await response.json();
            // alert("Agent launched successfully!");
            // console.log('Agent launch response:', data);
        // } else {
            // const errorData = await response.json();
            // console.error('Error launching agent:', errorData.error);
            // alert("Error launching agent: " + errorData.error);
        // }
    // } catch (error) {
        // console.error('Error launching agent:', error);
        // alert("Error launching agent: " + error.message);
    // }
// }

function isValidLinkedInProfileUrl(url) {
    // This regex allows for a broader range of characters in the vanity URL
    // part and accounts for potential query parameters or fragments.
    const linkedInProfileUrlPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]{3,100}(\/|$|\?|#)/;
    return linkedInProfileUrlPattern.test(url);
}

function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0] && tabs[0].url) {
                resolve(tabs[0].url);
            } else {
                reject('No active tab found.');
            }
        });
    });
}

// Function to append a LinkedIn URL to the Google Sheet
async function appendLinkedInUrlToGoogleSheet(sheetId, linkedInUrl) {
    try {
		console.log(`Fetching URL: ${HOST}/append_linkedin_url_google_sheet`); // This should show the full URL
        const response = await fetch(`${HOST}/append_linkedin_url_google_sheet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ google_sheet_id: sheetId, new_profile_url: linkedInUrl })
        });
        const data = await response.json();
		alert(getMessage('successful_follow_profile'));
        return data;
    } catch (error) {
        console.error('Error appending LinkedIn URL:', error);
        return null;
    }
}

// Function to get scraper results
async function getScraperResult(agentId) {
    try {
        const response = await fetch(`${HOST}/get_scrapper_result/${agentId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error getting scraper results:', error);
        return null;
    }
}

function createDataElement(key, value) {
    const element = document.createElement('div');
    element.style.marginBottom = '10px';

    if (typeof value === 'object' && value !== null) {
        element.innerHTML = `<strong>${key}:</strong>`;
        Object.keys(value).forEach(subKey => {
            element.appendChild(createDataElement(subKey, value[subKey]));
        });
    } else {
        element.textContent = `${key}: ${value}`;
    }

    return element;
}

function displayScrapedData(data) {
    const dataContainer = document.createElement('div');
    dataContainer.id = 'data-container';

    Object.keys(data).forEach(key => {
        dataContainer.appendChild(createDataElement(key, data[key]));
    });

    const jsonStr = JSON.stringify(data, null, 2);
    const dataUrl = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonStr);

    // Create the download button HTML with the data URL
	const downloadButtonHTML = `
    <button id="download-json-btn" href="${dataUrl}" download="linkedin_data.json" class="icon-btn download-btn">
    <img src="icons/download-icon.png" alt="Download" class="icon">
    <span class="tooltip-text">${getMessage('download_json')}</span>
	</button>`;
    // Combine data and button into one HTML string
    const combinedContent = dataContainer.outerHTML + downloadButtonHTML;
    
    // Open in new popup window
    openInNewPopup(combinedContent, data);
}

function openInNewPopup(content) {
    const newWindow = window.open('', '_blank', 'width=800,height=600');

    // Get URLs for each CSS file using chrome.runtime.getURL
    const baseCSS = chrome.runtime.getURL('css/base.css');
    const buttonsCSS = chrome.runtime.getURL('css/buttons.css');
    const utilitiesCSS = chrome.runtime.getURL('css/utilities.css');
    const layoutCSS = chrome.runtime.getURL('css/layout.css');
    const toggleCSS = chrome.runtime.getURL('css/toggle.css');
    const tooltipCSS = chrome.runtime.getURL('css/tooltip.css');
    const setupCSS = chrome.runtime.getURL('css/setup.css');
    const modalCSS = chrome.runtime.getURL('css/modal.css');
    const dataWindowCSS = chrome.runtime.getURL('css/data_window.css');

    // Start writing the HTML content for the new window
    newWindow.document.write('<html><head><title>LinkedIn Data</title>');

    // Include each CSS file
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${baseCSS}">`);
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${buttonsCSS}">`);
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${utilitiesCSS}">`);
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${layoutCSS}">`);
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${toggleCSS}">`);
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${tooltipCSS}">`);
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${setupCSS}">`);
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${modalCSS}">`);
    newWindow.document.write(`<link rel="stylesheet" type="text/css" href="${dataWindowCSS}">`);

    // Continue with the body content
    newWindow.document.write('</head><body class="body-data-view-window">');
    newWindow.document.write(content);
    newWindow.document.write('</body></html>');

    // Close the document
    newWindow.document.close();
}


function downloadJSON(data) {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', 'linkedin_data.json');
    document.body.appendChild(downloadAnchorNode); // Append to the body of the main extension window
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

async function getFollowedProfiles() {
    try {
        const response = await fetch(`${HOST}/get_followed_profiles`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const followedProfiles = await response.json();
        return followedProfiles;
    } catch (error) {
        console.error('Error getting followed profiles:', error);
        return [];
    }
}

async function followProfile() {
    const currentUrl = await getCurrentTabUrl();
    if (isValidLinkedInProfileUrl(currentUrl)) {
        try {
			const successMsg = getMessage('successful_follow_profile');
			const errorMsg = getMessage('invalid_linkedin_url');
			const postData = {
							 ProfileSourceType: 1,
							 ProfileId: currentUrl
							};
							

			makeAuthenticatedRequest(`${HOST}ProfileScan/Scan/UserProfileToFollow/Add/`, 'POST', postData, successMsg, errorMsg);
            // const successMsg = await fetch(`${HOST}/append_linkedin_url_google_sheet`, {
                // method: 'POST',
                // headers: {
                    // 'Content-Type': 'application/json'
                // },
                // body: JSON.stringify({
                    // google_sheet_id: GOOGLE_SHEET_ID,
                    // new_profile_url: currentUrl
                // })
            // });
            // const data = await response.json();
            // if (response.ok) {
				// isCurrentlyFollowed = true;  // Update the state
                // setFollowButtonState(true);  // Update UI
                // //setFollowButtonState(false); // Update button state to 'unfollow'
				// alert(getMessage('successful_follow_profile')); // Use a localized message
            // } else {
				// alert(getMessage('invalid_linkedin_url')); // Use a localized message
			// }	
        } catch (error) {
            console.error('Error following profile:', error);
        }
    }
}

async function unfollowProfile() {
    const currentUrl = await getCurrentTabUrl();
    if (isValidLinkedInProfileUrl(currentUrl)) {
        try {
            const response = await fetch(`${HOST}/delete_linkedin_url_google_sheet`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    google_sheet_id: GOOGLE_SHEET_ID,
                    profile_url: currentUrl
                })
            });
            const data = await response.json();
            if (response.ok) {
                //setFollowButtonState(true); // Update button state to 'follow'
				isCurrentlyFollowed = false;  // Update the state
                setFollowButtonState(false);  // Update UI
				alert(getMessage('successful_unfollow_profile')); // Use a localized message
            } else {
				alert(getMessage('invalid_linkedin_url')); // Use a localized message
            }
        } catch (error) {
            console.error('Error unfollowing profile:', error);
        }
    }
}

function makeAuthenticatedRequest(url, method, body, successMsg, errorMsg) {
    // Retrieve jwtToken from chrome storage
    chrome.storage.local.get('jwtToken', function(data) {
        if (data.jwtToken) {
            const jwtToken = data.jwtToken;
            // Prepare fetch options
            const fetchOptions = {
                method: method, // Use dynamic method
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwtToken // Use the token here
                }
            };
            // If the method is POST, add body to the request
            if (method === 'POST' && body) {
                fetchOptions.body = JSON.stringify(body);
            }

            // Use jwtToken for your API call
            fetch(url, fetchOptions)
                .then(response => {
                    if (!response.ok) {
                        // Better error handling for non-OK responses
                        return response.text().then(text => {
                            throw new Error(text || 'Request failed with status ' + response.status);
                        });
                    }
                    return response;
                })
                .then(data => {
                    alert(successMsg);
                    console.log(data); // Process the data
                })
                .catch(error => {
                    alert(errorMsg + ': ' + error.message);
                    console.error('Error making authenticated request:', error);
                });
        } else {
            console.error('JWT token not found');
        }
    });
}


function initializeMainInterface() {
    
	// Update placeholder and error message text
    //updatePlaceholderAndErrorText();

	// Now call the rest of the initialization functions here
	initializeLanguage();
	getFollowedProfiles();
	initializeExtension();

	
}

export { initializeMainInterface, getFollowedProfiles, attachEventListeners, isValidLinkedInProfileUrl, setIsCurrentlyFollowed, getIsCurrentlyFollowed, isCurrentlyFollowed, getCurrentTabUrl, unfollowProfile, followProfile};
