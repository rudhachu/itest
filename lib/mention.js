const { MediaUrls } = require('./handler');

async function mention(m, text) {
    const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];
    const jsonArray = text.match(/{.*}/g);  // Ensure the regex is correct for matching JSON.

    let msg = text.replace(jsonArray ? jsonArray[0] : '', '');  // Safely handle jsonArray.
    let type = 'text';
    let message = { contextInfo: {} };

    // Check if the message type matches one of the known types
    for (const mediaType of types) {
        if (msg.includes(mediaType)) {
            type = mediaType.replace('type/', '');
            break;
        }
    }

    // If there's JSON data, parse it
    if (jsonArray) {
        try {
            message = JSON.parse(jsonArray[0]);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
        }
    }

    // Handle link preview
    if (message.linkPreview) {
        message.contextInfo = message.contextInfo || {};
        message.contextInfo.externalAdReply = message.linkPreview;
    }

    // Adjust the thumbnail URL if available
    if (message.contextInfo?.externalAdReply?.thumbnail) {
        message.contextInfo.externalAdReply.thumbnailUrl = message.contextInfo.externalAdReply.thumbnail;
        delete message.contextInfo.externalAdReply.thumbnail;
    }

    delete message.linkPreview;

    let URLS = MediaUrls(msg);

    if (type !== 'text' && URLS[0]) {
        // Remove URLs from message text
        URLS.forEach(url => {
            msg = msg.replace(url, '');
        });

        msg = msg.replace('type/', '').replace(type, '').replace(/,/g, '').trim();

        const URL = URLS[Math.floor(Math.random() * URLS.length)];  // Random URL selection

        // Handle media types accordingly
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
                break;

            case 'sticker':
                message.mimetype = 'image/webp';
                return await m.sendSticker(m.jid, URL, message);

            case 'gif':
                message.gifPlayback = true;
                message.video = { url: URL };
                break;

            default:
                message.text = msg;
                return await m.client.sendMessage(m.jid, message);
        }

        return await m.client.sendMessage(m.jid, message);
    } else {
        // Handle '@sender' mention if present
        if (msg.includes('&sender')) {
            msg = msg.replace('&sender', '@' + m.number);
            message.contextInfo.mentionedJid = [m.sender];
        }

        message.text = msg;
        return await m.client.sendMessage(m.jid, message);
    }
}

module.exports = { mention };