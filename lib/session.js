const fs = require('fs');
const path = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios'); 

async function connectSession(sessionId, folderPath = './session/') {
  const RandomNames = [
    'Rudhra~rUd0hRaArH3dur',
    'Rudhra~ArH0durRUd3rA',
    'Rudhra~RUd0rAaRh3DuR',
    'Rudhra~aRh0DuRrUd3hRa',
  ];

  const randomName = RandomNames[Math.floor(Math.random() * RandomNames.length)];

  const PasteId = sessionId.replace(`{${randomName}}`, '');  
  
  const outputPath = path.join(folderPath, "creds.json");
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
