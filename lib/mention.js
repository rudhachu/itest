const { MediaUrls } = require('./handler');

async function mention(m, text) {
    const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];
    const jsonArray = text.match(/({.*})/g);
    
    let msg = text.replace(jsonArray, '');
    let type = 'text';
    let message = { contextInfo: {} };

    // Determine the message type
    for (const mediaType of types) {
        if (msg.match(mediaType)) {
            type = mediaType.replace('type/', '');
            break;
        }
    }

    // Parse JSON if present
    if (jsonArray) {
        message = JSON.parse(jsonArray[0]);
    }

    // Handle link preview
    if (message.linkPreview) {
        message.contextInfo = message.contextInfo || {};
        message.contextInfo.externalAdReply = message.linkPreview;
    }

    // Adjust thumbnail URL if present
    if (message.contextInfo?.externalAdReply?.thumbnail) {
        message.contextInfo.externalAdReply.thumbnailUrl = message.contextInfo.externalAdReply.thumbnail;
        delete message.contextInfo.externalAdReply.thumbnail;
    }

    delete message.linkPreview;

    let URLS = MediaUrls(msg);

    if (type !== 'text' && URLS[0]) {
        URLS.forEach(url => {
            msg = msg.replace(url, '');
        });

        msg = msg.replace('type/', '').replace(type, '').replace(/,/g, '').trim();
        let URL = URLS[Math.floor(Math.random() * URLS.length)];

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
        }

        return await m.client.sendMessage(m.jid, message);
    } else {
        // Mention sender if "&sender" is included
        if (msg.includes('&sender')) {
            msg = msg.replace('&sender', '@' + m.number);
            message.contextInfo.mentionedJid = [m.sender];
        }

        message.text = msg;
        return await m.client.sendMessage(m.jid, message);
    }
}

module.exports = { mention };