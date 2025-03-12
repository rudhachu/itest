const fs = require('fs');
const path = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios');

async function connectSession(sessionId, folderPath = './session/') {
  const AllowedMatchid = [
    'Rudhra~rUd0hRaArH3dur',
    'Rudhra~ArH0durRUd3rA',
    'Rudhra~RUd0rAaRh3DuR',
    'Rudhra~aRh0DuRrUd3hRa',
  ];

  // Extract the matchId from the sessionId (assuming a known format)
  const matchId = sessionId.split('~')[1]; // Adjust this based on the format of sessionId

  // Validate the matchId against AllowedMatchid
  if (!AllowedMatchid.includes(matchId)) {
    console.error('Invalid matchId!');
    return;
  }

  const outputPath = path.join(folderPath, "creds.json");
  const PasteId = sessionId.replace(`${matchId}~`, '');  // Extract PasteId by removing matchId prefix
  const pastebinUrl = `https://pastebin.com/raw/${PasteId}`;

  console.log(`PASTE URL: ${pastebinUrl}`);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  try {
    const response = await axios.get(pastebinUrl);

    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    writeFileSync(outputPath, data);
    console.log('Session ID loaded successfully', outputPath);

  } catch (error) {
    console.error('Invalid session id from Pastebin:', error);
  }
}

module.exports = { connectSession };
