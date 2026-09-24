const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Real API generation route using Apiframe
app.post('/api/generate-track', async (req, res) => {
    try {
        const { prompt } = req.body;
        const apiKey = process.env.APIFRAME_API_KEY;

        const response = await fetch('https://api.apiframe.ai/v2/music/generate', {
            method: 'POST',
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                model: 'suno',
                sunoParams: { model_version: 'V4_5PLUS' }
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Check job status route
app.get('/api/job-status/:id', async (req, res) => {
    try {
        const jobId = req.params.id;
        const apiKey = process.env.APIFRAME_API_KEY;

        const response = await fetch(`https://api.apiframe.ai/v2/jobs/${jobId}`, {
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
    console.log(`AISUNG app is live on port ${PORT}`);
});
