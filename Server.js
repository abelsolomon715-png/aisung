const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/api/status', (req, res) => {
    res.json({ status: 'online', message: 'AISUNG AI MUSIKA Engine is running smoothly!' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`AISUNG app is live on port ${PORT}`);
});
