const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Endpoint to fetch World Cup results from the JSON file
app.get('/api/wc-results', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'matches.json');
    const matches = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(matches);
  } catch (error) {
    console.error('Error reading matches.json:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
