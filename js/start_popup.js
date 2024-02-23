// start_popup.js
document.getElementById('login-btn').addEventListener('click', function() {
    chrome.browserAction.setPopup({popup: "login_popup.html"});
    window.location.href = "login_popup.html";
});

document.getElementById('register-btn').addEventListener('click', function() {
    chrome.browserAction.setPopup({popup: "register_popup.html"});
    window.location.href = "registration_popup.html";
});
