const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai'); 

const app = express();
const PORT = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/generate-track', async (req, res) => {
    try {
        const genre = req.body.genre || "Pop";
        const subGenre = req.body.subGenre || "Synth-Pop";
        const isInstrumental = req.body.isInstrumental || false;
        const youtubeUrl = req.body.youtubeUrl || null;
        
        // Strict command structure enforcing the 100-character cap limit
        let systemPrompt = `You are a music generator. Convert the user input into a short, comma-separated list of studio style tags.
        CRITICAL: The entire output must be extremely short—under 100 characters total. No full sentences, no explanations, just raw tags.`;
        
        let userPrompt = `Style: ${subGenre} ${genre}.`;
        
        if (isInstrumental) {
            systemPrompt += ` Force instrumental track, strictly zero vocals, no singing.`;
        } else {
            systemPrompt += ` Include clean studio vocals.`;
        }

        if (youtubeUrl) {
            userPrompt += ` Match the general mood/tempo of: ${youtubeUrl}.`;
        }

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt
        });

        const aiResponse = await model.generateContent(userPrompt);
        let refinedPrompt = aiResponse.response.text().trim();
        
        // Safety insurance: Hard chop the string at 110 characters just in case the AI goes over
        if (refinedPrompt.length > 110) {
            refinedPrompt = refinedPrompt.substring(0, 110);
        }
        console.log("Gemini Output Prompt (Character Guard Active):", refinedPrompt);

        const apiKey = process.env.APIFRAME_API_KEY;

        // Perfectly structured body matching Apiframe's current V2 requirements
        const payloadBody = {
            model: "suno",
            prompt: refinedPrompt,
            sunoParams: {
                model_version: "V4_5PLUS",
                style: refinedPrompt
            }
        };

        const apiframeResponse = await fetch('https://apiframe.ai', {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payloadBody)
        });

        const data = await apiframeResponse.json();
        console.log("Apiframe Outgoing Response:", data);
        res.json(data); 
    } catch (error) {
        console.error("Backend pipeline error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/job-status/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const apiKey = process.env.APIFRAME_API_KEY;

        const response = await fetch(`https://apiframe.ai{jobId}`, {
            method: 'GET',
            headers: { 'X-API-Key': apiKey }
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log("AISUNG engine is up and running successfully.");
});
