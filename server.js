const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

let cachedResults = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour cache

async function scrapeSoccerwayWorldCup() {
  const url = 'https://us.soccerway.com/international/world/world-cup/2022-qatar/s17627/';

  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'WC2026GameMonitor/1.0 (+https://jackplug.github.io/wc26)'
      }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('.matches .match').each((i, elem) => {
      const homeTeam = $(elem).find('.team-home .name').text().trim();
      const awayTeam = $(elem).find('.team-away .name').text().trim();
      const scoreText = $(elem).find('.score').text().trim();
      const scoreMatch = scoreText.match(/(\d+)\s*-\s*(\d+)/);

      if (scoreMatch) {
        results.push({
          homeTeam,
          awayTeam,
          homeScore: parseInt(scoreMatch, 10),
          awayScore: parseInt(scoreMatch, 10)
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Error scraping Soccerway:', error);
    return null;
  }
}

app.get('/api/wc-results', async (req, res) => {
  const now = Date.now();

  if (cachedResults && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    console.log('Serving cached Soccerway results');
    return res.json(cachedResults);
  }

  const results = await scrapeSoccerwayWorldCup();

  if (results) {
    cachedResults = results;
    cacheTimestamp = now;
    res.json(results);
  } else {
    res.status(500).json({ error: 'Failed to scrape Soccerway results' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
