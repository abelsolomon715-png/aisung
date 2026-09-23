const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('AISUNG AI MUSIKA Backend Engine is Live!');
});// Prompt Expansion Engine Route
app.post('/expand-prompt', (req, res) => {
    const userInput = req.body.prompt;
    
    if (!userInput) {
        return res.status(400).json({ error: 'Please provide a prompt description.' });
    }

    // Universal AI Prompt Expansion Logic
    const expandedPrompt = `Style/Genre: Contemporary fusion, 115 BPM, cinematic mood. Instrumentation: Rich bassline, rhythmic percussion, ambient pads, traditional acoustic integration. Arrangement & Flow: Smooth melodic progression, dynamic rhythm groove. Vocal Profile: Expressive, clean emotional delivery. Production & Mix: High fidelity studio-grade acoustic space, analog warmth. Focus on user theme: ${userInput}`;

    res.json({
        success: true,
        originalInput: userInput,
        optimizedPrompt: expandedPrompt
    });
});

app.listen(PORT, () => {
    console.log(`AISUNG server running on port ${PORT}`);
});

