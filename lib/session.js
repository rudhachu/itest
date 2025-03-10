const axios = require('axios');
const path = require('path');
const fs = require('fs');

function saveJsonToFile(mergedJSON, outputFolderPath) {
    if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath, { recursive: true });
    }
    for (const [fileName, fileContent] of Object.entries(mergedJSON)) {
        const outputPath = path.join(outputFolderPath, fileName);
        fs.writeFileSync(outputPath, JSON.stringify(fileContent, null, 2));
        console.log(`Saved ${fileName} to ${outputPath}`);
    }
}

async function connectSession(sessionId, folderPath) {

    try {
        const decryptedSessionId = sessionId.replace('Some-Custom-Words_', '');
        
        const response = await axios.get(`https://pastebin.com/raw/${decryptedSessionId}`);

        await saveJsonToFile(response.data, folderPath)
        console.log("session loaded successfully");

    } catch (error) {

        console.error("An error occurred:", error.message);

    }

}


module.exports = { connectSession };
