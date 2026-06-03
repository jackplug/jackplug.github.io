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

async function scrapeWorldCupResults() {
  const url = 'https://en.wikipedia.org/wiki/2022_FIFA_World_Cup';

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const results = [];

    // Select all match tables under the "Matches" section
    $('span#Matches').parent().nextAll('table.wikitable').each((i, table) => {
      $(table).find('tr').each((j, row) => {
        const cols = $(row).find('td');
        if (cols.length >= 5) {
          const homeTeam = $(cols).text().trim();
          const awayTeam = $(cols).text().trim();
          const scoreText = $(cols).text().trim();
          const scores = scoreText.split('–').map(s => parseInt(s.trim()));

          if (scores.length === 2 && !isNaN(scores) && !isNaN(scores)) {
            results.push({
              homeTeam,
              awayTeam,
              homeScore: scores,
              awayScore: scores
            });
          }
        }
      });
    });

    return results;
  } catch (error) {
    console.error('Wikipedia scraping error:', error);
    return null;
  }
}

app.get('/api/wc-results', async (req, res) => {
  const now = Date.now();

  // Serve cached data if fresh
  if (cachedResults && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return res.json(cachedResults);
  }

  // Scrape fresh data
  const results = await scrapeWorldCupResults();
  if (results) {
    cachedResults = results;
    cacheTimestamp = now;
    return res.json(results);
  } else {
    return res.status(500).json({ error: 'Failed to scrape results' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
