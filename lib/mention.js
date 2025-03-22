const { MediaUrls, toPTT } = require('./handler');

async function mention(m, text) {
    try {
        const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];
        const jsonArray = text.match(/({.*})/g);
        let msg = text.replace(jsonArray, '').trim();
        let type = 'text';
        let message = { contextInfo: {} };

        // Determine message type
        for (const mediaType of types) {
            if (msg.includes(mediaType)) {
                type = mediaType.replace('type/', '');
                msg = msg.replace(mediaType, '').trim();
                break;
            }
        }

        // Parse JSON metadata if present
        if (jsonArray) {
            try {
                message = JSON.parse(jsonArray[0]);
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }

        // Handle link preview
        if (message.linkPreview) {
            message.contextInfo = message.contextInfo || {};
            message.contextInfo.externalAdReply = message.linkPreview;

            if (message.contextInfo.externalAdReply.thumbnail) {
                message.contextInfo.externalAdReply.thumbnailUrl = message.contextInfo.externalAdReply.thumbnail;
                delete message.contextInfo.externalAdReply.thumbnail;
            }
            delete message.linkPreview;
        }

        // Extract URLs from message
        let urls = mentionUrls(msg);
        if (type !== 'text' && urls.length > 0) {
            msg = msg.replace(urls.join(' '), '').trim();
            let selectedUrl = urls[Math.floor(Math.random() * urls.length)];

            switch (type) {
                case 'image':
                    message.mimetype = 'image/jpeg';
                    message.image = { url: selectedUrl };
                    break;
                case 'video':
                    message.mimetype = 'video/mp4';
                    message.video = { url: selectedUrl };
                    break;
                case 'audio':
                    message.mimetype = 'audio/ogg; codecs=opus';
                    message.ptt = true;
                    message.audio = { url: selectedUrl };
                    break;
                case 'sticker':
                    message.mimetype = 'image/webp';
                    return await m.sendSticker(m.jid, selectedUrl, message);
                case 'gif':
                    message.gifPlayback = true;
                    message.video = { url: selectedUrl };
                    break;
                default:
                    break;
            }
            return await m.client.sendMessage(m.jid, message);
        } else {
            // Handle text mentions
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

module.exports = { mention };
