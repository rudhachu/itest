const {
    plugin,
    getJson,
    mode
} = require("../lib/");
const fetch = require('node-fetch');

// URL Validation Functions
const isIgUrl = (text) => /(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[\w-]+\/?)/.test(text);
const isFbUrl = (text) => /(https?:\/\/(?:www\.)?(?:facebook\.com|fb\.com|fb\.watch)\/[^\s]+)/.test(text);
const isYtUrl = (text) => /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+)/.test(text);

// Plugin Definition
plugin({
    on: "text",
    fromMe: mode,
    desc: "Auto download media from any URL",
    type: "auto",
},
    async (message, match) => {
        const text = match.trim();
        if (isIgUrl(text)) {
            await downloadInstaMedia(message, text);
        } else if (isFbUrl(text)) {
            await downloadFacebookMedia(message, text);
        } else if (isYtUrl(text)) {
            await downloadYoutubeMedia(message, text);
        }
    }
);

// Instagram Media Downloader
const downloadInstaMedia = async (message, url) => {
    try {
        await message.reply("_Downloading..._");
        const response = await getJson(`https://api-25ca.onrender.com/api/instagram?url=${url}`);

        if (!response || !response.status || !response.result || response.result.length === 0) {
            return await message.reply("*No media found!*");
        }

        await message.reply("_Uploading media... ⎙_", { quoted: message.data });

        for (const mediaUrl of response.result) {
            await message.sendFromUrl(mediaUrl);
        }
    } catch (error) {
        console.error("Instagram Download Error:", error);
        await message.reply("*Failed to fetch media.*\n_Please try again later._");
    }
};

// Facebook Media Downloader
const downloadFacebookMedia = async (message, url) => {
    try {
        await message.reply("_Downloading..._");
        const fbApi = `https://api.siputzx.my.id/api/d/fbdown?url=${encodeURIComponent(url)}`;
        const response = await fetch(fbApi);

        if (!response.ok) {
            return await message.reply("*Error fetching media. Please try again.*");
        }

        const data = await response.json();
        const mediaList = data.data;

        if (!mediaList || mediaList.length === 0) {
            return await message.reply("*No media found for the provided URL.*");
        }

        await message.reply("_Uploading media... ⎙_", { quoted: message.data });

        let counter = 0;
        for (const media of mediaList) {
            if (counter >= 10) break;
            await message.sendFile(media.url);
            counter++;
        }
    } catch (error) {
        console.error("Facebook Download Error:", error);
        await message.reply("*Failed to fetch media. Please try again later.*");
    }
};

// YouTube Media Downloader
const downloadYoutubeMedia = async (message, url) => {
    try {
        await message.reply("_Downloading..._");
        const ytApi = `https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(url)}`;
        const response = await fetch(ytApi);

        if (!response.ok) {
            return await message.reply("*Failed to fetch media. Please try again later.*");
        }

        const result = await response.json();
        if (!result || !result.data || !result.data.dl) {
            return await message.reply("*No valid download link found.*");
        }

        const { dl: mp3, title } = result.data;

        await message.reply(`_Downloading ${title}_`);

        await message.client.sendMessage(
            message.jid,
            { audio: { url: mp3 }, mimetype: 'audio/mp4' },
            { quoted: message.data }
        );

        await message.client.sendMessage(
            message.jid,
            { document: { url: mp3 }, mimetype: 'audio/mpeg', fileName: `${title}.mp3`, caption: `_${title}_` },
            { quoted: message.data }
        );
    } catch (error) {
        console.error("YouTube Download Error:", error);
        await message.reply("*Failed to download audio. Please try again later.*");
    }
};