const { MediaUrls, toPTT } = require('./handler');

async function mention(m, text) {
    try {
        // Define supported media types
        const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];

        // Extract JSON configuration and clean up the message text
        const jsonArray = text.match(/({.*})/g);
        let msg = text.replace(jsonArray, '').trim();
        let type = 'text';
        let message = { contextInfo: {} };

        // Determine the message type
        for (const mediaType of types) {
            if (msg.includes(mediaType)) {
                type = mediaType.replace('type/', '');
                msg = msg.replace(mediaType, '').trim();
                break;
            }
        }

        // Parse the extracted JSON configuration if available
        if (jsonArray) {
            message = JSON.parse(jsonArray[0]);
        }

        // Handle link previews
        if (message.linkPreview) {
            message.contextInfo = message.contextInfo || {};
            message.contextInfo.externalAdReply = message.linkPreview;
            if (message.contextInfo.externalAdReply.thumbnail) {
                message.contextInfo.externalAdReply.thumbnailUrl = message.contextInfo.externalAdReply.thumbnail;
                delete message.contextInfo.externalAdReply.thumbnail;
            }
            delete message.linkPreview;
        }

        // Extract and process media URLs
        let URLS = MediaUrls(msg);
        if (type !== 'text' && URLS.length > 0) {
            // Remove URLs from the message text
            URLS.forEach(url => (msg = msg.replace(url, '').trim()));

            // Select a random URL
            let URL = URLS[Math.floor(Math.random() * URLS.length)];

            // Handle different media types
            switch (type) {
                case 'image':
                    message.mimetype = 'image/jpg';
                    message.image = { url: URL };
                    break;
                case 'video':
                    message.mimetype = 'video/mp4';
                    message.video = { url: URL };
                    break;
                case 'audio':
                    message.mimetype = 'audio/ogg; codecs=opus';
                    message.ptt = true;
                    message.audio = { url: URL };
                    if (toPTT) await toPTT(message);
                    break;
                case 'sticker':
                    message.mimetype = 'image/webp';
                    return await m.sendSticker(m.jid, URL, message);
                case 'gif':
                    message.gifPlayback = true;
                    message.video = { url: URL };
                    break;
            }

            return await m.client.sendMessage(m.jid, message);
        } else {
            // Handle plain text messages
            if (msg.includes('&sender')) {
                msg = msg.replace('&sender', '@' + m.number);
                message.contextInfo.mentionedJid = [m.sender];
            }
            message.text = msg;
            return await m.client.sendMessage(m.jid, message);
        }
    } catch (error) {
        console.error('Error in mention function:', error);
    }
}

module.exports = {
    mention
};
