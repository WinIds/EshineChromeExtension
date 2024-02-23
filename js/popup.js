// popup.js

document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('registration-form');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Extract data from form
        var name = document.getElementById('name').value.trim();
        var email = document.getElementById('email').value.trim();
        var phone = document.getElementById('phone').value.trim();
        var password = document.getElementById('password').value.trim();

        // Prepare the data object to be sent
        var registrationData = {
            name: name,
            email: email,
            phone: phone,
            password: password
        };

        // Perform the validation
        if (validateRegistrationData(registrationData)) {
            // If validation passes, send the registration data
            chrome.runtime.sendMessage({
                message: "register",
                registrationData: registrationData
            }, function(response) {
                if (response.success) {
                    // Handle success, such as showing a success message or redirecting
                    alert('Registration successful!');
                } else {
                    // Handle failure, such as showing an error message
                    alert('Registration failed: ' + response.error);
                }
            });
        }
    });

    // Utility function to validate the registration data
    function validateRegistrationData(data) {
        const namePattern = /^[a-zA-Z ]{2,30}$/;
        const emailPattern = /^[^@]+@\w+(\.\w+)+\w$/;
        const phonePattern = /^\+[1-9]{1}0?[0-9]{3,14}$/; // International phone format
        const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

        if (!namePattern.test(data.name)) {
            alert("Invalid name. Please enter a valid name.");
            return false;
        }
        if (!emailPattern.test(data.email)) {
            alert("Invalid email. Please enter a valid email address.");
            return false;
        }
        if (!phonePattern.test(data.phone)) {
            alert("Invalid phone number. Please enter a valid phone number.");
            return false;
        }
        if (!passwordPattern.test(data.password)) {
            alert("Invalid password. Password must contain at least 8 characters, including uppercase, lowercase letters, and numbers.");
            return false;
        }
        return true; // All validations passed
    }

});
