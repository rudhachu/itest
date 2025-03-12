const fs = require('fs');
const path = require('path');
const { writeFileSync } = require('fs');
const axios = require('axios');

async function connectSession(sessionId, folderPath = './session/') {
  const outputPath = path.join(folderPath, "creds.json");

  // Replace the known prefixes from the sessionId using a map for more clarity and scalability
  const replacementPatterns = [
    'Rudhra~rUd0hRaArH3dur',
    'Rudhra~RUd0rAaRh3DuR',
    'Rudhra~ArH0durRUd3rA',
    'Rudhra~aRh0DuRrUd3hRa'
  ];

  let PasteId = sessionId;
  replacementPatterns.forEach(pattern => {
    PasteId = PasteId.replace(pattern, '');
  });

  const pastebinUrl = `https://pastebin.com/raw/${PasteId}`;
  console.log(`PASTE URL: ${pastebinUrl}`);

  // Ensure the folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  try {
    // Fetch session data from Pastebin
    const response = await axios.get(pastebinUrl);

    if (response.data) {
      const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      // Check if file exists, and handle appropriately (overwrite or create)
      if (fs.existsSync(outputPath)) {
        console.log('File already exists. Overwriting...');
      }

      writeFileSync(outputPath, data);
      console.log('Session ID loaded successfully:', outputPath);
    } else {
      console.error('No data received from Pastebin.');
    }

  } catch (error) {
    console.error('Error loading session ID from Pastebin:', error.message);
  }
}

module.exports = { connectSession };
