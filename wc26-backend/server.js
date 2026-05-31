require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Endpoint to fetch match data from Football-Data.org
app.get('/api/matches', async (req, res) => {
  try {
    const apiUrl = 'https://api.football-data.org/v4/matches';
    const headers = {
      'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY // Use environment variable for API key
    };

    const response = await axios.get(apiUrl, { headers });
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching from API:", error);
    res.status(500).json({ error: "Failed to fetch match data" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

