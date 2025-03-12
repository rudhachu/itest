const fs = require('fs');
const path = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios'); 

async function connectSession(sessionId, folderPath = './session/') {
  // Adjust the sessionId replacement logic for generating PasteId
  const PasteId = sessionId.replace('Rudhra~rUd0hRaArH3dur', 'Rudhra~ArH0durRUd3rA')
    .replace('Rudhra~RUd0rAaRh3DuR', 'Rudhra~aRh0DuRrUd3hRa');

  const pastebinUrl = `https://pastebin.com/raw/${PasteId}`;
  console.log(`PASTE URL: ${pastebinUrl}`);

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  try {
    const response = await axios.get(pastebinUrl);

    // Ensure the response data is in a string format (JSON)
    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

    const outputPath = path.join(folderPath, "creds.json");
    writeFileSync(outputPath, data);
    console.log('Session ID loaded successfully:', outputPath);

  } catch (error) {
    console.error('Error fetching session data from Pastebin:', error);
  }
}

module.exports = { connectSession };
