// api.js

// Ensure these imports are at the top of your apikey.js file
import { initializeLanguage, getMessage } from './language.js';
import { updateFollowButton, setFollowButtonState, initializeExtension } from './follow_button.js';

const HTTPS_HOST = "https://localhost:7017"
const HTTP_HOST = "http://localhost:5017"
const AGENT_ID = "7526152325410312"
const GOOGLE_SHEET_ID = "1RrJjy0GH-KPJurPosNLp2O5hu0_arnlgCBTAoCXmfkE"
let followedUrls = [];
let isCurrentlyFollowed = false;

function attachEventListeners() {

    document.getElementById('see-data-btn').addEventListener('click', () => {
		getCurrentTabUrl().then(url => {
			if (isValidLinkedInProfileUrl(url)) {
				getScrappedData(url);
			}
	})});
	
    document.getElementById('follow-btn').addEventListener('click', () => {
		getCurrentTabUrl().then(url => {
			if (isValidLinkedInProfileUrl(url)) {
				isCurrentlyFollowed ? unfollowProfile() : followProfile();
			}
		})
	});
	
	document.getElementById('show-latest-btn').addEventListener('click', () => {
		showLatestUpdates();
	});
	
	document.getElementById('check-candidate-btn').addEventListener('click', () => {
	getCurrentTabUrl().then(url => {
		if (isValidLinkedInProfileUrl(url)) {
			// Send message to background script to change the popup
			chrome.runtime.sendMessage({action: "checkCandidateClicked"});
			window.location.href = "job_extraction_popup.html"; // Navigate back to job_extraction_popup.html
		}
	})});
	
	document.getElementById('generate-btn').addEventListener('click', () => {
	getCurrentTabUrl().then(url => {
		if (isValidLinkedInProfileUrl(url)) {
			// Send message to background script to change the popup
			chrome.runtime.sendMessage({action: "checkGenerateClicked"});
			window.location.href = "job_extraction_popup.html"; // Navigate back to job_extraction_popup.html
		}
	})});
}



function getScrappedData(profileUniqueId) {
    getScraperResult(`${HTTPS_HOST}/SmartProfile/SmartProfile/Stats/${encodeURIComponent(profileUniqueId)}?accept=text/plain`)
    .then(data => {
        console.log('Scraper data:', data);
        displayScrapedData(data);
    })
    .catch(error => {
        console.error('Failed to get scraped data:', error);
    });
}
function setIsCurrentlyFollowed(isFollowed) {
       isCurrentlyFollowed = isFollowed
}

function getIsCurrentlyFollowed() {
       return isCurrentlyFollowed;
}
			


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
async function getScraperResult(url) {
     try {
        // Ensure this returns a promise that resolves with the scraper data
        const data = await makeAuthenticatedRequest(url, 'GET', null, null, null);
        return data;
    } catch (error) {
        console.error('Error getting scraper results:', error);
        throw error; // Ensure that errors are propagated
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

	if (!data) {
			console.error('displayScrapedData was called with null or undefined data');
			return; // Early return to avoid further processing
		}
		
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
							
			await makeAuthenticatedRequest(`${HTTPS_HOST}/ProfileScan/Scan/UserProfileToFollow/Add?accept=text/plain`, 'POST', postData, successMsg, errorMsg);
	
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

async function matchToJob() {
    const jobUrl = document.getElementById('job-url').value.trim();
	const profileUrl = document.getElementById('profile-url').value.trim();
	if (jobUrl && profileUrl) {
		// Wrap sendMessage in a promise to handle asynchronous response
		var url = `https://localhost:7017/SmartProfile/SmartProfile/MatchToJob?jobUniqueUrl=${encodeURIComponent(jobUrl)}&profileUniqueId=${encodeURIComponent(profileUrl)}&profileSourceType=1`;
		const data = await makeAuthenticatedRequest(url, 'GET', null, null, null);
		displayScrapedData(data);
	}
}

async function showLatestUpdates() {
	if (jobUrl && profileUrl) {
		// Wrap sendMessage in a promise to handle asynchronous response
		var url = `https://localhost:7017/SmartProfile/SmartProfile/Stats/GetLatestUpdatedProfiles`;
		const data = await makeAuthenticatedRequest(url, 'GET', null, null, null);
	    displayScrapedData(data);
	}
}

async function generateContact() {
    const jobUrl = document.getElementById('job-url').value.trim();
	const profileUrl = document.getElementById('profile-url').value.trim();
	if (jobUrl && profileUrl) {
		// Wrap sendMessage in a promise to handle asynchronous response
		var url = `https://localhost:7017/SmartProfile/SmartProfile/GenerateContact?jobUniqueUrl=${encodeURIComponent(jobUrl)}&profileUniqueId=${encodeURIComponent(profileUrl)}&profileSourceType=1`;
		const data = await makeAuthenticatedRequest(url, 'GET', null, null, null);
		displayScrapedData(data);
	}

}

async function makeAuthenticatedRequest(url, method, body, successMsg, errorMsg) {
    // Wrap the chrome.storage.local.get call in a Promise
    const jwtToken = await new Promise((resolve, reject) => {
        chrome.storage.local.get('jwtToken', function(data) {
            if (data.jwtToken) {
                resolve(data.jwtToken);
            } else {
                reject('JWT token not found');
            }
        });
    });

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

    try {
        // Use jwtToken for your API call
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            // Better error handling for non-OK responses
            const text = await response.text();
            throw new Error(text || 'Request failed with status ' + response.status);
        }

        // Optionally process the response further, e.g., convert to JSON
        const data = await response.json(); // or .text() if expecting a text response

        if(successMsg){
            alert(successMsg);
        }
        console.log(data); // Process the data
        return data; // Ensure you return the data for the caller to use
    } catch (error) {
        alert(errorMsg + ': ' + error.message);
        console.error('Error making authenticated request:', error);
        throw error; // Rethrow to ensure the caller can handle it
    }
}



function initializeMainInterface() {
    
	// Update placeholder and error message text
    //updatePlaceholderAndErrorText();

	// Now call the rest of the initialization functions here
	initializeLanguage();
	getFollowedProfiles();
	initializeExtension();

	
}

export { initializeMainInterface, getFollowedProfiles, attachEventListeners, isValidLinkedInProfileUrl, setIsCurrentlyFollowed, getIsCurrentlyFollowed, isCurrentlyFollowed, getCurrentTabUrl, unfollowProfile, followProfile, makeAuthenticatedRequest, matchToJob, generateContact};
