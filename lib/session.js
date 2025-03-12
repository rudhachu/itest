const fs = require('fs');
const path = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios');

async function connectSession(sessionId, folderPath = './session/') {
  const Match = [
    'Rudhra~rUd0hRaArH3dur',
    'Rudhra~ArH0durRUd3rA',
    'Rudhra~RUd0rAaRh3DuR',
    'Rudhra~aRh0DuRrUd3hRa',
  ];

  const outputPath = path.join(folderPath, 'creds.json');
  
  const PasteId = sessionId.match(/\${Match(\w+)}/)?.[1];
  
  if (!PasteId) {
    console.error('Invalid session ID format');
    return;
  }

  const pastebinUrl = `https://pastebin.com/raw/${PasteId}`;
  console.log(`PASTE URL: ${pastebinUrl}`);

  const resolvedFolderPath = path.resolve(folderPath);

  if (!fs.existsSync(resolvedFolderPath)) {
    fs.mkdirSync(resolvedFolderPath, { recursive: true });
  }

  try {
    const response = await axios.get(pastebinUrl);

    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);

    writeFileSync(outputPath, data);
    console.log('Session ID loaded successfully', outputPath);
  } catch (error) {
    console.error('Invalid session id from Pastebin:', error);
  }
}

module.exports = { connectSession };
