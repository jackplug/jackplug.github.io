const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const API_URL = 'https://api.football-data.org/v4/matches';
const API_TOKEN = process.env.API_KEY; // Set your Football-Data.org API key in Render environment variables

// Cache variables
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutes cache

app.get('/api/matches', async (req, res) => {
  const now = Date.now();

  // Serve cached data if fresh
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    console.log('Serving cached data');
    return res.json(cachedData);
  }

  // Otherwise fetch fresh data
  try {
    console.log('Fetching fresh data from Football-Data.org');
    const response = await axios.get(API_URL, {
      headers: { 'X-Auth-Token': API_TOKEN }
    });

    cachedData = response.data;
    cacheTimestamp = now;

    res.json(cachedData);
  } catch (error) {
    console.error('Error fetching data from Football-Data.org:', error.message);

    // If cache exists, serve stale data as fallback
    if (cachedData) {
      console.log('Serving stale cached data due to API error');
      return res.json(cachedData);
    }

    res.status(500).json({ error: 'Failed to fetch match data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
