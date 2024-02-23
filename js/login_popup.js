// login_popup.js

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const goBackBtn = document.getElementById('go-back-btn');
    const errorMessage = document.getElementById('error-message'); // Assume you have an error message div

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Basic validation
        if (!validateEmail(email) || password.length < 3) {
            showErrorMessage('Please provide a valid email and a password of at least 8 characters.');
            return;
        }

        login(email, password);
    });

    goBackBtn.addEventListener('click', function() {
        window.location.href = "start_popup.html"; // Navigate back to start_popup.html
    });

	function login(email, password) {
		fetch('http://localhost:5017/api/Login/Login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email: email, password: password })
		})
		.then(response => {
			if (!response.ok) throw new Error('Login failed');
			return response.json();
		})
		.then(data => {
			// Save jwtToken to chrome storage
			chrome.storage.local.set({jwtToken: data.jwtToken}, function() {
				console.log('Token saved to chrome storage');
			});

			chrome.browserAction.setPopup({popup: "popup.html"}); // Set to main popup on successful login
			window.location.href = "popup.html"; // Redirect to main popup.html
		})
		.catch(error => {
			showErrorMessage(error.message);
		});
	}


    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.toLowerCase());
    }

    function showErrorMessage(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block'; // Make sure the error message is visible
        } else {
            alert(message); // Fallback to alert if errorMessage element is not available
        }
    }
});
