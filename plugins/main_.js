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
    desc: 'Change sticker and audio metadata',
    react: "⚒️",
    fromMe: mode,
    type: "utility"
}, async (message, match) => {

    const { reply_message } = message;
    if (!reply_message.sticker && !reply_message.audio && !reply_message.image && !reply_message.video) {
        return message.reply('Reply to a sticker, audio, image, or video.');
    }
    
    if (reply_message.sticker || reply_message.image || reply_message.video) {
        match = match || config.STICKER_DATA;  
        let media = await reply_message.download();
        let [packname, author] = match.split(/[|,;]/) || [config.STICKER_DATA, ''];
        return await message.sendSticker(message.jid, media, {
            packname: packname || config.STICKER_DATA,
            author: author || ''
        });
    }

    if (reply_message.audio) {
        const defaultAudioData = config.AUDIO_DATA?.split(/[|,;]/) || ['Unknown Title', 'Unknown Author', ''];
        const audioMetadata = match?.split(/[|,;]/) || defaultAudioData;

        const metadataOptions = {
            title: audioMetadata[0] || defaultAudioData[0],
            body: audioMetadata[1] || defaultAudioData[1],
            image: audioMetadata[2] || defaultAudioData[2]
        };

        try {
            const downloadedAudio = await reply_message.download();
            const convertedAudio = await toAudio(downloadedAudio);
            const audioWithMetadata = await AudioMetaData(convertedAudio, metadataOptions);

            return await message.send(audioWithMetadata, { mimetype: 'audio/mpeg' }, 'audio');
        } catch (error) {
            console.error("Audio processing failed: ", error);
            return message.reply('Failed to process audio.');
        }
    }
});
