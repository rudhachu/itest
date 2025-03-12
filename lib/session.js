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
  
  // Fix: Extract PasteId using a regular expression
  const pasteIdMatch = sessionId.match(/\${Match([^}]+)}/);
  if (!pasteIdMatch || !pasteIdMatch[1]) {
    console.error('Invalid session ID format: Unable to extract PasteId.');
    return;
  }
  
  const PasteId = pasteIdMatch[1];

  const pastebinUrl = `https://pastebin.com/raw/${PasteId}`;
  console.log(`PASTE URL: ${pastebinUrl}`);

  // Fix: Normalize folder path to an absolute path
  const resolvedFolderPath = path.resolve(folderPath);

  // Ensure the folder exists
  if (!fs.existsSync(resolvedFolderPath)) {
    fs.mkdirSync(resolvedFolderPath, { recursive: true });
  }

  try {
    const response = await axios.get(pastebinUrl);

    // Fix: Ensure response data is properly converted to a JSON string
    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);

    writeFileSync(outputPath, data);
    console.log('Session ID loaded successfully', outputPath);
  } catch (error) {
    console.error('Error fetching data from Pastebin:', error);
  }
}

module.exports = { connectSession };
