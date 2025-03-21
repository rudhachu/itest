function mentionUrls(text) {
    let array = [];
    const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
    let urls = text.match(regexp);
    if (urls) {
        urls.forEach(url => {
            if (['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webp', 'ogg', 'mp3', 'wav'].includes(url.split('.').pop().toLowerCase())) {
                array.push(url);
            }
        });
        return array;
    }
    return false;
}

async function mention(m, text) {
    const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];
    const jsonArray = text.match(/({.*})/g);
    let msg = text.replace(jsonArray, '');
    let type = 'text';
    let message = { contextInfo: {} };

    for (const mediaType of types) {
        if (msg.includes(mediaType)) {
            type = mediaType.replace('type/', '');
            break;
        }
    }

    if (jsonArray) {
        try {
            message = JSON.parse(jsonArray[0]);
        } catch (e) {
            console.error("JSON Parsing Error:", e);
        }
    }

    if (message.linkPreview) {
        message.contextInfo.externalAdReply = message.linkPreview;
    }

    if (message.contextInfo?.externalAdReply?.thumbnail) {
        message.contextInfo.externalAdReply.thumbnailUrl = message.contextInfo.externalAdReply.thumbnail;
        delete message.contextInfo.externalAdReply.thumbnail;
    }

    delete message.linkPreview;
    
    let URLS = mentionUrls(msg);
    if (type !== 'text' && URLS && URLS.length > 0) {
        URLS.forEach(url => {
            msg = msg.replace(url, '');
        });

        msg = msg.replace('type/', '').replace(type, '').replace(/,/g, '').trim();
        let URL = URLS[Math.floor(Math.random() * URLS.length)];
        let fileExt = URL.split('.').pop().toLowerCase();

        if (type === 'image') {
            message.mimetype = 'image/jpeg';
            message.image = { url: URL };
        } else if (type === 'video') {
            message.mimetype = 'video/mp4';
            message.video = { url: URL };
        } else if (type === 'audio') {
            message.mimetype = fileExt === 'ogg' ? 'audio/ogg' : 'audio/mpeg';
            message.audio = { url: URL, ptt: true }; // `ptt: true` makes it a voice note
        } else if (type === 'sticker') {
            message.mimetype = 'image/webp';
            return await m.sendSticker(m.jid, URL, message);
        } else if (type === 'gif') {
            message.gifPlayback = true;
            message.video = { url: URL };
        }

        return await m.client.sendMessage(m.jid, message);
    } else {
        if (msg.includes('&sender')) {
            msg = msg.replace('&sender', '@' + m.number);
            message.contextInfo.mentionedJid = [m.sender];
        }
        message.text = msg;
        return await m.client.sendMessage(m.jid, message);
    }
}

module.exports = { mention };
