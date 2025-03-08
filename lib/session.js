const path = require('path');
const fs = require('fs');
const axios = require('axios');

async function MakeSession(sessionId) {
  const PasteId = sessionId.replace('Some-Custom-Words_', '').trim();

  if (!PasteId) {
    console.error('Invalid sessionId: Missing Pastebin ID');
    return;
  }

  const pastebinUrl = `https://pastebin.com/raw/${PasteId}`;
  console.log(`Fetching credentials from: ${pastebinUrl}`);

  try {
    const response = await axios.get(pastebinUrl);

    if (!response.data) {
      throw new Error('Empty response from Pastebin');
    }

    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const credsPath = path.join(__dirname, '..', 'session', 'creds.json');

    // Ensure the session directory exists
    fs.mkdirSync(path.dirname(credsPath), { recursive: true });

    // Write data to creds.json
    fs.writeFileSync(credsPath, data);
    console.log('Successfully saved credentials.');
  } catch (error) {
    console.error('Error fetching or saving credentials:', error.message || error);
  }
}

module.exports = MakeSession;
