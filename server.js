// Add these at the TOP of your server.js file
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1); // Exit the process after logging the error
});

// Your existing code
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/fifa-results', async (req, res) => {
  try {
    const apiKey = 'c101ce7193e14d33a00b497f8b55c2cf';
    const url = 'https://api.football-data.org/v4/competitions/WC/matches';

    const response = await axios.get(url, {
      headers: { 'X-Auth-Token': apiKey },
    });

    res.json(response.data.matches);
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
