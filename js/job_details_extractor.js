// Assuming this is a content script that extracts job details from a job listing page

let extractedJobDetails = {}; // Define globally to store extracted job details

function extractContentBySelectors(selectors) {
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            return Array.from(elements).map(element => element.innerText.trim()).join("\n\n");
        }
    }
    return "Information not found."; // Default message if no content is found
}

function extractJobDetails() {
    // Define selectors for job description and requirements based on observed DOM structures
    const descriptionSelectors = ["div.job-description", "section.job-description", "div[role='main'] article", "div#JobDescription", "div.description-section", ".job-detail-description"];
    const requirementsSelectors = ["div.job-requirements", "section.job-requirements", "ul.requirements-list", "div.requirements", ".qualification", ".qualifications"];

    // Extract content using defined selectors
    const jobDescription = extractContentBySelectors(descriptionSelectors);
    const jobRequirements = extractContentBySelectors(requirementsSelectors);

    // Store extracted details globally
    extractedJobDetails = { description: jobDescription, requirements: jobRequirements };
	
	return extractedJobDetails;
}

// Listener for messages from popup or background script to trigger job details extraction
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "extractJobDetails") {
        // Perform extraction and respond with extracted details
        extractJobDetails();
        sendResponse({ success: true, data: extractedJobDetails });
    } else if (request.action === "requestJobDetails") {
        // Respond with already extracted job details
        if (extractedJobDetails) {
            sendResponse({ success: true, data: extractedJobDetails });
        } else {
            sendResponse({ success: false, error: "Job details not extracted yet." });
        }
    }
    return true; // Indicate asynchronous response
});

// Automatically extract job details if this script is injected into a job listing page
extractJobDetails();
