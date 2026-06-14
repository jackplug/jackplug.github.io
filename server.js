const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// CORS: Allow requests from your frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Scraper function
async function scrapeWikipediaWorldCup2026() {
  const url = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup';
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  };

  try {
    console.log('Fetching Wikipedia page...');
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);
    const matches = [];

    $('[itemtype="http://schema.org/SportsEvent"]').each((i, event) => {
      const $event = $(event);
      const homeTeam = $event.find('.fhome a').text().trim();
      const awayTeam = $event.find('.faway a').text().trim();
      const scoreText = $event.find('.fscore a').text().trim();

      if (!homeTeam || !awayTeam || !scoreText) {
        console.log(`Skipping match ${i}: missing data`);
        return;
      }

      // Parse score
      const scoreParts = scoreText.split('–');
      if (scoreParts.length !== 2) {
        console.log(`Skipping match ${homeTeam} vs ${awayTeam}: invalid score format "${scoreText}"`);
        return;
      }

      const homeScore = parseInt(scoreParts[0], 10);
      const awayScore = parseInt(scoreParts[1], 10);

      // Skip only if score parsing failed (NaN)
      if (isNaN(homeScore) || isNaN(awayScore)) {
        console.log(`Skipping match ${homeTeam} vs ${awayTeam}: score is NaN`);
        return;
      }

      // Extract goal scorers
      const extractName = (a) => {
        const title = $(a).attr('title') || '';
        if (typeof title !== 'string') return '';
        const parts = title.split(' (');
        return parts[0].trim();
      };

      const homeGoalScorers = [];
      $event.find('.fhgoal a').each((j, a) => {
        const name = extractName(a);
        if (name) homeGoalScorers.push(name);
      });

      const awayGoalScorers = [];
      $event.find('.fagoal a').each((j, a) => {
        const name = extractName(a);
        if (name) awayGoalScorers.push(name);
      });

      matches.push({
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        homeGoalScorers,
        awayGoalScorers
      });
    });

    console.log(`Total matches parsed: ${matches.length}`);
    return matches;
  } catch (error) {
    console.error('Error scraping Wikipedia:', error.message);
    return null;
  }
}

// API endpoint to return matches
app.get('/api/wc-results', async (req, res) => {
  try {
    console.log('Scraping Wikipedia for World Cup 2026 matches...');
    const matches = await scrapeWikipediaWorldCup2026();
    if (matches && matches.length > 0) {
      console.log(`Returning ${matches.length} matches.`);
      res.json(matches);
    } else {
      res.status(503).json({ error: 'No matches found or scraping failed.' });
    }
  } catch (error) {
    console.error('Error in /api/wc-results:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
