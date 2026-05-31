// server.js - Secure SaaS Backend Logic
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Kisi bhi domain ko hit karne ki permission deta hai
app.use(express.json());

// Aapki Secret Gemini Key jo hamesha hidden rahegi
const MASTER_GEMINI_KEY = process.env.GEMINI_API_KEY || "YAHAN_APNI_GEMINI_KEY_DALO_AGAR_LOCAL_TEST_KARNA_HAI";

app.post('/api/chat', async (req, res) => {
    try {
        const { queryText, persona, rules, targetSite } = req.body;

        // Tight system rules prompt injection configuration
        const systemPrompt = `You are a professional production-grade AI Assistant for the website: ${targetSite || 'Client Business Platform'}. 
        Your locked behavior persona is: ${persona ? persona.toUpperCase() : 'SALES EXECUTIVE'}. 
        Strict business logic instructions to follow: "${rules || 'Be extremely helpful and convert leads.'}".
        
        CRITICAL GUARDRAIL: Keep replies brief, natural, and directly address the user. Match the language style of the user seamlessly.`;

        // Direct Secure Native HTTP Request to Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MASTER_GEMINI_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemPrompt}\n\nUser Question: ${queryText}` }] }]
            })
        });

        const data = await response.json();
        
        // Response format verification
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const botReply = data.candidates[0].content.parts[0].text;
            return res.json({ success: true, reply: botReply });
        } else {
            return res.json({ success: false, reply: "Humari core systems busy hain. Kripya thodi der baad prayas karein." });
        }

    } catch (error) {
        console.error("Backend Core Error:", error);
        res.status(500).json({ success: false, reply: "Internal Node Server Route Exception." });
    }
});

// Port allocation configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SaaS Gateway running safely on production port ${PORT}`));

