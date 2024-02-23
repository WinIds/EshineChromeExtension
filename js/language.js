// language.js - Manages language-related functionality

let localizedMessages = {};
let currentLanguage = 'en'; // Default language initialization

function initializeLanguage(callback) {
    // Initialization logic for language settings
     if (!["en-US", "en", "he"].includes(currentLanguage)) {
		 currentLanguage = 'en'; // Fallback to default if not supported
	 }
	document.getElementById('switch-lang-btn').addEventListener('click', switchLanguage);
    return loadLocalizedMessages(currentLanguage, true);
	
}

function switchLanguage(callback) {
    const newLang = currentLanguage === 'en' ? 'he' : 'en';
    localStorage.setItem('userLang', newLang);
    currentLanguage = newLang;
    return loadLocalizedMessages(newLang)
        .then(() => {
            updateUIForLanguage(newLang, false, true);
            if (typeof updatePlaceholderAndErrorText === 'function') {
                updatePlaceholderAndErrorText();
            }
        })
        .catch(error => console.error('Error switching language:', error));
}


 function loadLocalizedMessages(lang, isInit = false) {
    const messagesUrl = `_locales/${lang}/messages.json`;
    return fetch(messagesUrl) // fetch always returns a Promise
        .then(response => response.json())
        .then(messages => {
            localizedMessages = messages;
            updateUIForLanguage(lang, isInit);
        })
        .catch(error => {
            console.error('Failed to load language file:', error);
            throw error; // Propagate error
        });
}


 function getMessage(messageKey) {
     return localizedMessages[messageKey]?.message || `Missing text: ${messageKey}`;
 }

function getCurrentLanguage() {
    return currentLanguage;
}


function updateUIForLanguage(lang, isInit, isReEntry = false) {
    // Update text content for elements
	
	if (lang === 'he') {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }
		
	if(!isInit && !isReEntry){
		document.querySelectorAll('.lang-flag').forEach(flag => {
			flag.classList.toggle('hidden');
		});
	}
	
	document.getElementById('language-label').textContent = getMessage("language");
	
	const followMessageKey = 'follow'.toLowerCase().replace(/-/g, '_');
	document.getElementById('follow-tooltip').textContent = getMessage(followMessageKey);
	
	const seeDataMessageKey = 'see-data'.toLowerCase().replace(/-/g, '_');
	document.getElementById('see-data-tooltip').textContent = getMessage(seeDataMessageKey);
	
	const launchAgentMessageKey = 'check-candidate'.toLowerCase().replace(/-/g, '_');
	document.getElementById('check-candidate-tooltip').textContent = getMessage(launchAgentMessageKey);
	
}


export { initializeLanguage, loadLocalizedMessages, getMessage, updateUIForLanguage, getCurrentLanguage, switchLanguage };

