// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const chatForm = document.getElementById('chat-form');

// Konversationsverlauf
let conversationHistory = [
    { role: "system", content: "Du bist ein hilfreicher Restaurant-Chatbot. Du beantwortest Fragen über das Restaurant, die Speisekarte, Reservierungen und allgemeine Restaurant-Anfragen. Sei freundlich und professionell." }
];

// Add message to chat
function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'system'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('p');
    messageText.textContent = message;
    
    messageContent.appendChild(messageText);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

// Process user input
async function processUserInput(e) {
    e.preventDefault(); // Verhindert das Neuladen der Seite
    
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, true);
        userInput.value = '';
        
        // Füge die Benutzernachricht zum Verlauf hinzu
        conversationHistory.push({ role: "user", content: message });
        
        try {
            // Zeige "Bot schreibt..." an
            const typingIndicator = addMessage("Bot schreibt...", false);
            
            // API-Aufruf an unseren Backend-Server
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: conversationHistory })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            // Entferne den "Bot schreibt..." Indikator
            chatMessages.removeChild(typingIndicator);
            
            // Füge die Antwort zum Verlauf hinzu
            conversationHistory.push({ role: "assistant", content: data.response });
            
            // Zeige die Antwort an
            addMessage(data.response);
        } catch (error) {
            console.error('Fehler bei der API-Anfrage:', error);
            addMessage('Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.');
        }
    }
}

// Event Listeners
chatForm.addEventListener('submit', processUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        processUserInput(e);
    }
});

// Initial bot message
addMessage('Willkommen! Ich bin Ihr KI-Restaurant-Assistent. Wie kann ich Ihnen helfen?'); 