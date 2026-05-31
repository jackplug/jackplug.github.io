const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Endpoint to fetch matches from API-FOOTBALL
app.get('/api/matches', async (req, res) => {
  try {
    const apiUrl = 'https://v3.football.api-sports.io/fixtures';
    const params = {
      league: 1, // World Cup league ID (1 is for World Cup)
      season: 2022, // World Cup 2022 season
      from: '2022-11-20', // Start date of World Cup 2022
      to: '2022-12-18' // End date of World Cup 2022
    };
    const headers = {
      'x-apisports-key': process.env.FOOTBALL_DATA_API_KEY // Use your API key
    };

    const response = await axios.get(apiUrl, { params, headers });

    if (!response.data || !response.data.response) {
      throw new Error("No match data found in the API response.");
    }

    res.json(response.data.response);
  } catch (error) {
    console.error("Error fetching from API-FOOTBALL:", error.message);
    res.status(500).json({ error: "Failed to fetch match data", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

