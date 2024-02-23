// main.js

import { initializeMainInterface,attachEventListeners } from './api.js';


document.addEventListener('DOMContentLoaded', () => {
    initializeMainInterface();
	attachEventListeners(); // Ensure this is called here
});