function mentionUrls(text) {
    let array = [];
    const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
    let urls = text.match(regexp);
    if (urls) {
        urls.map(url => {
            if (["mp4", "mpeg", "mp3", "jpg", "jpeg", "png", "gif", "webp"].includes(url.split('.').pop().toLowerCase())) {
                array.push(url);
            }
        });
        return array;
    } else {
        return false;
    }
}

async function mention(m, text) {
    const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];
    const jsonArray = text.match(/({.*})/g);
    let msg = text.replace(jsonArray, '');
    let type = 'text',
        message = { contextInfo: {} };

    // Determine message type (text, image, video, etc.)
    for (const i in types) {
        if (msg.match(types[i])) {
            type = msg.match(types[i])[0].replace('type/', '');
            break;
        }
    }

    // Parse JSON data if available
    if (jsonArray) message = JSON.parse(jsonArray[0]);

    // Handle linkPreview and externalAdReply
    if (message.linkPreview) {
        message.contextInfo = message.contextInfo ? message.contextInfo : {};
        message.contextInfo.externalAdReply = message.linkPreview;
    }

    // Fix the thumbnail URL
    if (message.contextInfo?.externalAdReply?.thumbnail) {
        message.contextInfo.externalAdReply.thumbnailUrl = message?.contextInfo?.externalAdReply?.thumbnail;
        delete message.contextInfo.externalAdReply.thumbnail;
    }

    // Remove linkPreview from message
    delete message.linkPreview;

    // Extract media URLs if any
    let URLS = mentionUrls(msg);

    // If the message contains media (image, video, etc.), process and send the media
    if (type !== 'text' && URLS && URLS[0]) {
        // Remove media URLs from the text message
        URLS.forEach(url => msg = msg.replace(url, ''));
        msg = msg.replace('type/', '').replace(type, '').replace(/,/g, '').trim();

        // Randomly select a URL if there are multiple media URLs
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
            message.mimetype = 'audio/mpeg';
            message.ptt = true;
            message.audio = { url: URL };
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
        // If no media, process as text message
        if (msg.includes('&sender')) {
            msg = msg.replace('&sender', '@' + m.number);
            message.contextInfo.mentionedJid = [m.sender];
        }
        message.text = msg;
        return await m.client.sendMessage(m.jid, message);
    }
}

module.exports = { mention };
