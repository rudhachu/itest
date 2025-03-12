const path = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios');
const fs = require('fs'); 

async function MakeSession(sessionId, folderPath = './session/') {
  const outputPath = path.join(folderPath, "creds.json");
  const PasteId = sessionId.replace('Some-Custom-Words_', '');

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

module.exports = { MakeSession };
