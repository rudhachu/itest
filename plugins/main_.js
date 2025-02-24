const {
    plugin,
    fetchJson,
    getBuffer,
    sendUrl,
    mode,
    AudioMetaData,
    toAudio,
    config
} = require('../lib');
const fs = require('fs');

plugin({
    pattern: 'url',
    desc: 'convert image url',
    react: "⛰️",
    fromMe: mode,
    type: "converter"
}, async (message, match) => {
    if (!message.isMedia) return message.reply('_please reply to image/sticker/video/audio_');
    return await sendUrl(message, message.client);
});

plugin({
    pattern: 'take',
    desc: 'change sticker and audio authority',
    react: "⚒️",
    fromMe: mode,
    type: "utility"
}, async (message, match) => {
        if (!message.reply_message.sticker && !message.reply_message.audio && !message.reply_message.image && !message.reply_message.video) return message.reply('reply to a sticker/audio');
        if (message.reply_message.sticker || message.reply_message.image || message.reply_message.video) {
            match = match || config.STICKER_DATA;
            let media = await message.reply_message.download();
            return await message.sendSticker(message.jid, media, {
                packname: match.split(/[|,;]/)[0] || match,
                author: match.split(/[|,;]/)[1]
            });
        } else if (message.reply_message.audio) {
            const opt = {
                title: match ? match.split(/[|,;]/) ? match.split(/[|,;]/)[0] : match : config.AUDIO_DATA.split(/[|,;]/)[0] ? config.AUDIO_DATA.split(/[|,;]/)[0] : config.AUDIO_DATA,
                body: match ? match.split(/[|,;]/)[1] : config.AUDIO_DATA.split(/[|,;]/)[1],
                image: (match && match.split(/[|,;]/)[2]) ? match.split(/[|,;]/)[2] : config.AUDIO_DATA.split(/[|,;]/)[2]
            }
            const AudioMeta = await AudioMetaData(await toAudio(await message.reply_message.download()), opt);
            return await message.send(AudioMeta,{
                mimetype: 'audio/mpeg'
            },'audio');
        }
    })
