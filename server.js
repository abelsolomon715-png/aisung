const express = require('express');
const path = require('path');
// Updated to use the correct Google Generative AI SDK name
const { GoogleGenAI } = require('@google/generative-ai'); 

const app = express();
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/generate-track', async (req, res) => {
    try {
        const { genre, subGenre, isInstrumental, youtubeUrl } = req.body;
        
        let systemPrompt = `You are a music engineering system. Convert this raw genre input into precise music style tags for a text-to-audio API. 
        Output ONLY a comma-separated list of technical studio tags (instruments, mood, mixing specs, bpm). No conversational text, no explanations.`;
        
        let userPrompt = `Genre: ${genre}, Sub-Genre: ${subGenre}.`;
        
        if (isInstrumental) {
            systemPrompt += ` CRITICAL: The user requested an instrumental track. You must absolutely exclude vocals. Add tags like: pure instrumental, no singing, no vocals, zero voices, crisp acoustics. Do not mention vocal techniques like chants or singing.`;
        } else {
            systemPrompt += ` Optimize for pristine studio vocal presence, perfect pitch alignment, and high-fidelity vocal delivery matching the specified genre space.`;
        }

        if (youtubeUrl) {
            userPrompt += ` Match the general production tempo, atmospheric mood, and arrangement vibe of this track metadata placeholder: ${youtubeUrl}.`;
        }

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction: systemPrompt }
        });

        const refinedPrompt = aiResponse.text.trim();
        console.log("Gemini Orchestrated Prompt Target:", refinedPrompt);

        const apiKey = process.env.APIFRAME_API_KEY;
        const apiframeResponse = await fetch('https://apiframe.ai', {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: refinedPrompt,
                model: 'suno',
                lyrics: isInstrumental ? "[Instrumental Track]" : "", 
                sunoParams: { model_version: 'V4_5PLUS' }
            })
        });

        const data = await apiframeResponse.json();
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
    console.log(`AISUNG production build is live on port ${PORT}`);
});
