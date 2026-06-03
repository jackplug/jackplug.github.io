const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const API_KEY = process.env.ZAFRONIX_API_KEY; // Set this in Render environment variables
const BASE_URL = 'https://api.zafronix.com/fifa/worldcup/v1';

let cache = {}; // Cache per year

const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutes

app.get('/api/tournament/:year', async (req, res) => {
  const year = req.params.year;
  const now = Date.now();

  // Serve cached data if fresh
  if (cache[year] && (now - cache[year].timestamp) < CACHE_DURATION_MS) {
    console.log(`Serving cached data for year ${year}`);
    return res.json(cache[year].data);
  }

  // Fetch fresh data
  try {
    console.log(`Fetching fresh data for year ${year} from Zafronix`);
    const response = await axios.get(`${BASE_URL}/tournaments/${year}`, {
      headers: { 'X-API-Key': API_KEY }
    });

    cache[year] = {
      data: response.data,
      timestamp: now
    };

    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching data from Zafronix for year ${year}:`, error.message);

    if (cache[year]) {
      console.log(`Serving stale cached data for year ${year} due to error`);
      return res.json(cache[year].data);
    }

    res.status(500).json({ error: 'Failed to fetch tournament data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
