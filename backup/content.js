// --- Global Variables ---
let currentRole = ''; // Variable to store the selected role
let currentRoleId = ''; // Variable to store the selected role

// --- Role Configuration ---
const roles = {
    "Doctor": "doctor-icon.png",
    "painter": "painter-icon.png",
    "trainer": "trainer-icon.png",
	"software developer": "software-developer-icon.png",
    "data analyst": "data-analyst-icon.png",
    "cybersecurity specialist": "cybersecurity-specialist-icon.png",
	"digital marketing": "digital-marketing-icon.png",
    "project manager": "project-manager-icon.png",
    "user experience designer": "user-experience-designer-icon.png",
	"machine learning engineer": "machine-learning-engineer-icon.png",
    "business analyst": "business-analyst-icon.png",
    "mechanic": "mechanic-icon.png",
	"lawyer": "lawyer-icon.png",
    "financial advisor": "financial-advisor-icon.png",
    // Add more roles and their icons here
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    createRoleElements(roles);
    attachEventListeners();
});

// --- Role Element Creation ---
function createRoleElements(roles) {
    const roleContainer = document.getElementById('roleContainer');
    roleContainer.innerHTML = '';

    for (const [role, icon] of Object.entries(roles)) {
        const roleDiv = document.createElement('div');
        roleDiv.className = 'role';
        roleDiv.id = role.toLowerCase().replace(/\s+/g, '-');
        roleDiv.innerHTML = `<img src="icons/${icon}" alt="${role}"><p>${role}</p>`;
        roleContainer.appendChild(roleDiv);
    }
}

// --- Event Listeners ---
function attachEventListeners() {
    document.querySelectorAll('.role').forEach(item => {
        item.addEventListener('click', handleRoleSelection);
    });

    document.getElementById('send-button').addEventListener('click', handleSendMessage);
    document.getElementById('clear-history').addEventListener('click', clearChatHistory);
}

function handleRoleSelection(event) {
    currentRole = event.currentTarget.id;
    currentRoleId = currentRole.toLowerCase().replace(/\s+/g, '-');
    document.getElementById('chat-header').textContent = `${currentRole} Chat`;
    document.getElementById('chatInterface').style.display = 'block';
    updateChatHistory(currentRole);
}

function handleSendMessage() {
    const inputField = document.getElementById('chat-input');
    const userMessage = inputField.value;
    inputField.value = '';
    if (currentRole) {
        appendMessage(`You: ${userMessage}`, 'user');
        sendMessage(userMessage);
    } else {
        console.error('No role selected');
    }
}

function clearChatHistory() {
    localStorage.removeItem(currentRole);
    document.getElementById('chat-body').innerHTML = '';
}

// --- Chat History Management ---

function storeMessage(role, message, isUser) {
    let history = JSON.parse(localStorage.getItem(role)) || [];
    history.push({ isUser: isUser, text: message });
    localStorage.setItem(role, JSON.stringify(history));
}

function getHistory(role) {
    return JSON.parse(localStorage.getItem(role)) || [];
}

function updateChatHistory(role) {
    const history = getHistory(role);
    const chatBody = document.getElementById('chat-body');
    chatBody.innerHTML = ''; // Clear existing messages

    history.forEach(item => {
        const messageDiv = document.createElement('div');
        messageDiv.className = item.isUser ? 'user-message' : 'gpt-message';
        messageDiv.textContent = item.isUser ? `You: ${item.text}` : `GPT: ${item.text}`;
        chatBody.appendChild(messageDiv);
    });

    // Scroll to the bottom of the chat body
    chatBody.scrollTop = chatBody.scrollHeight;
}

async function sendMessage(message) {
    try {
        // Wait for the GPT response
        let gptResponse = await sendMessageToGPT(currentRoleId, message);

        // Store user message and GPT response
        storeMessage(currentRole, message, true); // Store user message
        storeMessage(currentRole, gptResponse, false); // Store GPT response

        // Update chat history in UI
        updateChatHistory(currentRole);
    } catch (error) {
        console.error('Error in sendMessage:', error);
        // Handle the error appropriately
    }
}

// Function to send messages to GPT and display the response
async function sendMessageToGPT(role, message) {
	
     // Call OpenAI's API - replace with your actual API call
    const gptResponse = await fetchGPTResponse(role, message);

    // Append GPT's response to the chat
    appendMessage(`${role}GPT: ${gptResponse}`, 'gpt');
	return gptResponse;
}


// Function to append a message to the chat
function appendMessage(text, sender) {
    const chatBody = document.getElementById('chat-body');
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message ${sender}-message`;

    // Different formatting for GPT responses
    if (sender === 'gpt') {
        const formattedText = `<strong>${currentRole}GPT:</strong> ${text}`;
        messageElement.innerHTML = formattedText; // Using innerHTML for formatted text
    } else {
        messageElement.textContent = text; // Plain text for user messages
    }

    chatBody.appendChild(messageElement);

    // Scroll to the bottom of the chat body
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Function to fetch response from OpenAI's GPT API
async function fetchGPTResponse(role, message) {
    const apiURL = 'https://api.openai.com/v1/chat/completions';
    const apiKey = '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'; // Replace with your actual API key

    const initialContext = generatePrompt(role,message);
	const messages = [
        { role: "system", content: initialContext },
        { role: "user", content: initialContext + " Question: " + message }
    ];

    try {
        const response = await fetch(apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
				model: "gpt-3.5-turbo",
				messages: messages,
                max_tokens: 350
            })
        });

        const data = await response.json();
		const reply = data.choices[0];
        return reply.message.content.trim();
    } catch (error) {
        console.error('Error fetching response from OpenAI:', error);
        return "Sorry, I couldn't process your request.";
    }
}

// Function to generate the GPT prompt based on the role
function generatePrompt(role,message) {
    // Customize this function based on how you want to handle different roles
    switch (role) {
        case 'doctor':
            return `As a doctor, respond only to medical queries within 150 characters. Ignore unrelated questions.`;
        case 'painter':
            return `As a painter, respond only to art-related questions within 150 characters. Ignore unrelated questions.`;
		case 'trainer':
			return `As a fitness trainer, respond only to fitness-related queries within 150 characters. Ignore unrelated questions.`;
		case 'software-developer':
			return `As a software developer, respond only to technology-related questions within 150 characters. Ignore unrelated questions.`;
		case 'data-analyst':
			return `As a data analyst, respond only to data analysis questions within 150 characters. Ignore unrelated questions.`;
		case 'cybersecurity-specialist':
			return `As a cybersecurity specialist, respond only to cybersecurity queries within 150 characters. Ignore unrelated questions.`;
		case 'digital-marketing':
			return `As a digital marketing specialist, respond only to marketing-related questions within 150 characters. Ignore unrelated questions.`;
		case 'project-manager':
			return `As a project manager, respond only to project management queries within 150 characters. Ignore unrelated questions.`;
		case 'user-experience-designer':
			return `As a UX designer, respond only to user experience questions within 150 characters. Ignore unrelated questions.`;
		case 'machine-learning-engineer':
			return `As a machine learning engineer, respond only to machine learning-related queries within 150 characters. Ignore unrelated questions.`;
		case 'business-analyst':
			return `As a business analyst, respond only to business analysis questions within 150 characters. Ignore unrelated questions.`;
		case 'mechanic':
			return `As a mechanic, respond only to mechanical queries within 150 characters. Ignore unrelated questions.`;
		case 'lawyer':
			return `As a lawyer, respond only to legal questions within 150 characters. Ignore unrelated questions.`;
		case 'financial-advisor':
			return `As a financial advisor, respond only to financial queries within 150 characters. Ignore unrelated questions.`;
        // Add more roles as needed
		
        default:
            return message;
    }
}

function createRoleElements(roles) {
    const roleContainer = document.getElementById('roleContainer');
    roleContainer.innerHTML = ''; // Clear existing content

    for (const [role, icon] of Object.entries(roles)) {
        const roleDiv = document.createElement('div');
        roleDiv.className = 'role';
        roleDiv.id = role.toLowerCase().replace(/\s+/g, '-'); // Convert role to a suitable id, e.g., 'data-scientist'

        roleDiv.innerHTML = `
            <img src="icons/${icon}" alt="${role}">
            <p>${role}</p>
        `;

        roleDiv.addEventListener('click', () => {
            // Your existing click event logic
            currentRole = role;
			currentRoleId = currentRole.toLowerCase().replace(/\s+/g, '-');
			updateChatHistory(role);
            document.getElementById('chat-header').textContent = `${currentRole} Chat`;
            document.getElementById('chatInterface').style.display = 'block';
        });

        roleContainer.appendChild(roleDiv);
    }
}

// document.querySelectorAll('.role').forEach(item => {
  // item.addEventListener('click', event => {
    // let role = event.currentTarget.id;
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      // chrome.tabs.sendMessage(tabs[0].id, {type: "open_chat", role: role});
	  // console.log("click sent");
    // });
  // });
// });


// chrome.storage.sync.get('premium', function(data) {
  // if (data.premium) {
    // // Enable premium features
  // } else {
    // // Restrict features
  // }
// });
