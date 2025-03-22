const { MediaUrls, toPTT } = require('./connection');

async function mention(m, text) {
    const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];
    const jsonArray = text.match(/({.*})/g);
    let msg = text.replace(jsonArray, '');
    let type = 'text',
        message = {
            contextInfo: {}
        };

    // Check for media types
    for (const i in types) {
        if (msg.match(types[i])) {
            type = msg.match(types[i])[0].replace('type/', '');
            break;
        }
    }

    // Parse JSON if exists
    if (jsonArray) {
        try {
            message = JSON.parse(jsonArray[0]);
        } catch (error) {
            console.error("Error parsing JSON:", error);
        }
    }

    // Handle link preview in context info
    if (message.linkPreview) {
        message.contextInfo = message.contextInfo ? message.contextInfo : {};
        message.contextInfo.externalAdReply = message.linkPreview;
    }

    if (message.contextInfo?.externalAdReply?.thumbnail) {
        message.contextInfo.externalAdReply.thumbnailUrl = message?.contextInfo?.externalAdReply?.thumbnail;
        delete message.contextInfo.externalAdReply.thumbnail;
    }

    delete message.linkPreview;

    let URLS = mentionUrls(msg);
    
    if (type !== 'text' && URLS[0]) {
        // Remove URLs from message
        URLS.map(url => msg = msg.replace(url, ''));
        msg = msg.replace('type/', '').replace(type, '').replace(/,/g, '').trim();
        
        let URL = URLS[Math.floor(Math.random() * URLS.length)];
        
        // Handle different media types
        if (type === 'image') {
            message.mimetype = 'image/jpg';
            message.image = { url: URL };
            return await m.client.sendMessage(m.jid, message);
        } else if (type === 'video') {
            message.mimetype = 'video/mp4';
            message.video = { url: URL };
            return await m.client.sendMessage(m.jid, message);
        } else if (type === 'audio') {
            message.mimetype = 'audio/ogg; codecs=opus';
            message.ptt = true;
            message.audio = { url: URL };
            
            // Ensure that toPTT modifies the audio correctly
            const pttMessage = await toPTT(URL, "opus");
            message = { ...message, ...pttMessage }; // Merge the audio data from toPTT()
            return await m.client.sendMessage(m.jid, message);
        } else if (type === 'sticker') {
            message.mimetype = 'image/webp';
            return await m.sendSticker(m.jid, URL, message);
        } else if (type === 'gif') {
            message.gifPlayback = true;
            message.video = { url: URL };
            return await m.client.sendMessage(m.jid, message);
        }
    } else {
        // Handle text messages and mentions
        if (msg.includes('&sender')) {
            msg = msg.replace('&sender', '@' + m.number);
            message.contextInfo.mentionedJid = [m.sender];
        }
        message.text = msg;
        return await m.client.sendMessage(m.jid, message);
    }
}

module.exports = {
    mention
};
