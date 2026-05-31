const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Endpoint to fetch World Cup 2022 matches from TheSportsDB
app.get('/api/matches', async (req, res) => {
  try {
    // World Cup 2022 league ID (you can find this on TheSportsDB)
    const worldCup2022LeagueId = '467'; // World Cup league ID

    const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/eventsleague.php?id=${worldCup2022LeagueId}`;

    const response = await axios.get(apiUrl);
    if (!response.data || !response.data.events) {
      throw new Error("No match data found in the API response.");
    }

    // Process the matches to include goal scorer data
    const matchesWithScorers = response.data.events.map(event => ({
      homeTeam: event.strHomeTeam,
      awayTeam: event.strAwayTeam,
      homeScore: event.intHomeScore || 0,
      awayScore: event.intAwayScore || 0,
      homeGoalScorers: event.strHomeGoalDetails ? event.strHomeGoalDetails.split(';').map(goal => goal.trim()) : [],
      awayGoalScorers: event.strAwayGoalDetails ? event.strAwayGoalDetails.split(';').map(goal => goal.trim()) : []
    }));

    res.json(matchesWithScorers);
  } catch (error) {
    console.error("Error fetching from TheSportsDB:", error.message);
    res.status(500).json({ error: "Failed to fetch match data", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
