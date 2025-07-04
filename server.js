const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'https://restaurant-chatbot-t2zf.onrender.com', // Ersetze dies mit deiner Render-Domain
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gemini API Initialisierung
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyB8QZ8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8');

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        // Konvertiere das Nachrichtenformat für Gemini
        const formattedMessages = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const chat = model.startChat({
            history: formattedMessages.slice(0, -1),
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(messages[messages.length - 1].content);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });
    } catch (error) {
        console.error('Fehler bei der Verarbeitung:', error);
        res.status(500).json({ error: 'Ein Fehler ist aufgetreten' });
    }
});

// Start Server
app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
}); 