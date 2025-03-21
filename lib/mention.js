function mentionUrls(text) {
    let array = [];
    const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()'@:%_\+.~#?!&//=]*)/gi;
    let urls = text.match(regexp);
    
    if (urls) {
        urls.forEach(url => {
            let ext = url.split('.').pop().toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webp'].includes(ext)) {
                array.push(url);
            }
        });
    }
    return array.length > 0 ? array : false;
}

async function mention(m, text) {
    const types = ['image', 'video', 'audio', 'sticker', 'gif'];
    const jsonArray = text.match(/({.*})/g);
    let msg = text.replace(/({.*})/g, '').trim();
    let type = 'text';
    let message = { contextInfo: {} };

    // Identify message type
    for (const t of types) {
        if (msg.includes(`type/${t}`)) {
            type = t;
            msg = msg.replace(`type/${t}`, '').trim();
            break;
        }
    }

    // Parse JSON data safely
    if (jsonArray) {
        try {
            message = JSON.parse(jsonArray[0]);
        } catch (error) {
            console.error("JSON parsing error:", error);
        }
    }

    // Handle link preview
    if (message.linkPreview) {
        message.contextInfo = message.contextInfo || {};
        message.contextInfo.externalAdReply = message.linkPreview;

        if (message.contextInfo.externalAdReply?.thumbnail) {
            message.contextInfo.externalAdReply.thumbnailUrl = message.contextInfo.externalAdReply.thumbnail;
            delete message.contextInfo.externalAdReply.thumbnail;
        }
        delete message.linkPreview;
    }

    let URLS = mentionUrls(msg);

    if (type !== 'text' && URLS) {
        msg = msg.replace(/,|type\/[a-z]+/g, '').trim();
        let URL = URLS[Math.floor(Math.random() * URLS.length)];

        if (type === 'image') {
            message.mimetype = 'image/jpeg';
            message.image = { url: URL };
        } else if (type === 'video') {
            message.mimetype = 'video/mp4';
            message.video = { url: URL };
        } else if (type === 'audio') {
            message.mimetype = 'audio/ogg; codecs=opus';
            message.ptt = true;
            message.audio = { url: URL };
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

module.exports = {
    mention
};
