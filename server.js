const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

// API route example for your music generation logic
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', message: 'AISUNG AI MUSIKA Engine is running smoothly!' });
});

// Fallback to serve index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`AISUNG app is live on port ${PORT}`);
});
