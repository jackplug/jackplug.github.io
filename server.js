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
    const { data } = await axios.get(url, {
      headers: { 'User-Agent': 'WC2026GameMonitor/1.0 (+https://jackplug.github.io/wc26)' }
    });

    const $ = cheerio.load(data);
    const results = [];

    $('table.footballbox').each((i, table) => {
      const homeTeam = $(table).find('.fhome').text().trim();
      const awayTeam = $(table).find('.faway').text().trim();

      const fullTimeScore = $(table).find('.fscore').first().text().trim();
      const scoreMatch = fullTimeScore.match(/(\d+)\s*–\s*(\d+)/);

      if (homeTeam && awayTeam && scoreMatch) {
        results.push({
          homeTeam,
          awayTeam,
          homeScore: parseInt(scoreMatch, 10),
          awayScore: parseInt(scoreMatch, 10)
        });
      }
    });

    console.log(`Scraped ${results.length} matches from Wikipedia.`);
    return results;

  } catch (error) {
    console.error('Wikipedia scraping error:', error);
    return null;
  }
}

app.get('/api/wc-results', async (req, res) => {
  const now = Date.now();

  if (cachedResults && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return res.json(cachedResults);
  }

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
