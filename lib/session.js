const fs = require('fs');
const path = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios');

async function connectSession(sessionId, folderPath = './session/') {
  const outputPath = path.join(folderPath, "creds.json");

  let PasteId = sessionId;
  PasteId = PasteId.replace('Rudhra~rUd0hRaArH3dur');
  PasteId = PasteId.replace('Rudhra~RUd0rAaRh3DuR');
  PasteId = PasteId.replace('Rudhra~ArH0durRUd3rA');
  PasteId = PasteId.replace('Rudhra~aRh0DuRrUd3hRa');

  const pastebinUrl = `https://pastebin.com/raw/${PasteId}`;
  console.log(`PASTE URL: ${pastebinUrl}`);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  try {
    const response = await axios.get(pastebinUrl);

    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    writeFileSync(outputPath, data);
    console.log('Session ID loaded successfully:', outputPath);

  } catch (error) {
    console.error('Error loading session ID from Pastebin:', error.message);
  }
}

module.exports = { connectSession };
