const { cutAudio, cutVideo, toAudio, toPTT, isAdmin, isBotAdmin, getCompo, getDate, parsedJid, PREFIX, mode, extractUrlsFromString, getJson, isIgUrl, getUrl, isNumber, MediaUrls } = require('./handler');
const {commands} = require('./main/events')
const config = require('../config')
const os = require('os');
let img_url, theam = 'text';
let { WORKTYPE, BOT_INFO } = require("../config");
const packageJson = require("../package.json");
const ID3Writer = require('browser-id3-writer');
const FormData = require('form-data');
const axios = require('axios');
const api = "76a050f031972d9f27e329d767dd988f" || "deb80cd12ababea1c9b9a8ad6ce3fab2";
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg');

function isInstagramURL(url) {
	var pattern = /^https?:\/\/(www\.)?instagram\.com\/.*/i;
	return pattern.test(url);
}

const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`
}

const getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (err) {
		return err
	}
}

const fetchJson = async (url, options) => {
    try {
        options ? options : {}
        const res = await axios({
            method: 'GET',
            url: url,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
            },
            ...options
        })
        return res.data
    } catch (err) {
        return err
    }
}

const runtime = function(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " d, " : " d, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " h, " : " h, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " m, " : " m, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " s" : " s") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
};

const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const isUrl = (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
}

const bytesToSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const getSizeMedia = (path) => {
    return new Promise((resolve, reject) => {
        if (/http/.test(path)) {
            axios.get(path)
            .then((res) => {
                let length = parseInt(res.headers['content-length'])
                let size = exports.bytesToSize(length, 3)
                if(!isNaN(length)) resolve(size)
            })
        } else if (Buffer.isBuffer(path)) {
            let length = Buffer.byteLength(path)
            let size = exports.bytesToSize(length, 3)
            if(!isNaN(length)) resolve(size)
        } else {
            reject('error gatau apah')
        }
    })
}

function linkPreview(options={}) {
	if(!config.LINK_PREVIEW || config.LINK_PREVIEW.toLowerCase() == 'false' || !config.LINK_PREVIEW.toLowerCase() == 'null') return undefined;
	const opt = {
	       showAdAttribution: true,
               title: options.title || config.LINK_PREVIEW.split(/[;,|]/)[0] || '𝗥𝗨𝗗𝗛𝗥𝗔 𝗕𝗢𝗧',
               body:  options.body || config.LINK_PREVIEW.split(/[;,|]/)[1],
               mediaType: 1,
               thumbnailUrl: options.url || config.LINK_PREVIEW.split(/[;,|]/)[2] || 'https://raw.githubusercontent.com/rudhraan/media/main/image/rudhra1.jpg',
               sourceUrl: config.LINK_PREVIEW.split(/[;,|]/)[3] || 'https://whatsapp.com/channel/0029VasSpvKAe5Vp741msS3E'
             }
             return opt
}

const format = function(code) {
	let i = -1;
	let byt = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	do {
		code /= 1024;
		i++
	} while (code > 1024);
	return Math.max(code, 0.1).toFixed(1) + byt[i]
}
async function uploadImageToImgur(imagePath) {
	try {
		const data = new FormData();
		data.append('image', fs.createReadStream(imagePath));

		const headers = {
			'Authorization': `Client-ID 3ca8036b07e0f25`,
			...data.getHeaders()
		};

		const config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: 'https://api.imgur.com/3/upload',
			headers: headers,
			data: data
		};

		const response = await axios(config);
		return response?.data?.data?.link;
	} catch (error) {
		return `invalid location get:bad-get`;
	}
}

async function AudioMetaData(audio, info = {}) {
	let title = info.title || "Ʀ ᴜ ᴅ ʜ ʀ λ";
	let body = info.body ? [info.body] : [];
	let img = info.image || 'https://raw.githubusercontent.com/rudhraan/media/main/image/rudhra1.jpg';
	if (!Buffer.isBuffer(img)) img = await getBuffer(img);
	if (!Buffer.isBuffer(audio)) audio = await getBuffer(audio);
	const writer = new ID3Writer(audio);
	writer
		.setFrame("TIT2", title)
		.setFrame("TPE1", body)
		.setFrame("APIC", {
			type: 3,
			data: img,
			description: "Ƥ ʀ ɪ ɴ ᴄ ᴇ  Ʀ ᴜ ᴅ ʜ",
		});
	writer.addTag();
	return Buffer.from(writer.arrayBuffer);
}


function addSpace(text, length = 3, align = "left") {
	text = text.toString();
	if (text.length >= length) return text;
	const even = length - text.length % 2 != 0 ? length + 1 : length;
	const space = " ";
	if (align != "left" && align != "right") {
		for (let i = 0; i <= even / 2; i++) {
			if (text.length < even) {
				text = space + text + space;
			}
		}
		return text;
	}
	for (let i = 1; text.length < length; i++) {
		if (align == "left") text = text + space;
		if (align == "right") text = space + text;
	}
	return text;
}

async function sendUrl(message) {
if(message.reply_message.sticker) {
	const imageBuffer = await message.reply_message.download();
	const form = new FormData();
	form.append('image', imageBuffer, 'bt.jpg');
	form.append('key', api);
	const response = await axios.post('https://api.imgbb.com/1/upload', form, {
		headers: form.getHeaders()
	}).catch(e=>e.response);
	return await message.send(response.data.data.image.url);
	} else if (message.reply_message.image || message.image) {
	const msg = message.reply_message.image || message.image;
		const url = await uploadImageToImgur(await message.client.downloadAndSaveMediaMessage(msg))
		return await message.send(url);
	} else if (message.reply_message.video || message.video) {
	const msg = message.reply_message.video || message.video
		const url = await uploadImageToImgur(await message.client.downloadAndSaveMediaMessage(msg))
		return await message.send(url);
	} else if (message.reply_message.audio) {
	const msg = message.reply_message.audio;
		let urvideo = await message.client.downloadAndSaveMediaMessage(msg)
		await ffmpeg(urvideo)
			.outputOptions(["-y", "-filter_complex", "[0:a]showvolume=f=1:b=4:w=720:h=68,format=yuv420p[vid]", "-map", "[vid]", "-map 0:a"])
			.save('output.mp4')
			.on('end', async () => {
				const url = await uploadImageToImgur('./output.mp4')
				return await message.send(url);
			});
	}
}

async function send_menu(m) {
    const img_url = config.BOT_INFO.split(";")[2];
    const readMore = String.fromCharCode(8206).repeat(4001);
    let date = new Date().toLocaleDateString("EN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    let types = {};
    let menu = `┌───────────────────···•
│╭───────────────···▸
┴│      Hey 👋  ${m.pushName}
⬡│▸   *Bot Name* : ${config.BOT_INFO.split(";")[0]}
⬡│▸   *Version*  : ${require('../package.json').version}
⬡│▸   *Prefix*  : ${PREFIX}
⬡│▸   *Mode*  : ${config.WORKTYPE}
⬡│▸   *Commands*  : ${commands.length.toString()}
⬡│▸   *Date*  : ${date}
⬡│▸   *RAM*  : ${format(os.totalmem() - os.freemem())}
⬡│            
⬡│           █║▌║▌║║▌║ █
┬│            ʀ   ᴜ   ᴅ   ʜ   ʀ   ᴀ
│╰────────────────···▸
╰───────────────────···•\n ${readMore}`;

    // Group commands by type
    commands.forEach((command) => {
        if (command.pattern) {
            const type = command.type.toLowerCase();
            if (!types[type]) types[type] = [];
            types[type].push(command.pattern);
        }
    });

    // Generate command categories
    Object.keys(types).forEach((cmdType) => {
        menu += `\n┌───〈 *${cmdType.toUpperCase()}* 〉───◆`;
        menu += `\n│╭─────────────···▸`;
        types[cmdType].forEach((cmd) => {
            menu += `\n⬡│▸  ${cmd.replace(/[^a-zA-Z0-9,-]/g,"")}`;
        });
        menu += `\n│╰────────────···▸`;
        menu += `\n└───────────────···▸`;
    });

    // Message options
    const options = {
        contextInfo: {
            mentionedJid: [m.sender]
        }
    };

    // Handle link preview (if enabled)
    if (config.LINK_PREVIEW && config.LINK_PREVIEW.toLowerCase() !== 'null' && config.LINK_PREVIEW.toLowerCase() !== 'false') {
        options.contextInfo.externalAdReply = {};
        const image = MediaUrls(config.LINK_PREVIEW);
        if (image[0]) {
            options.contextInfo.externalAdReply.thumbnailUrl = image[0];
        }
        const linkData = config.LINK_PREVIEW.split(/[,;|]/);
        options.contextInfo.externalAdReply.showAdAttribution = true;
        options.contextInfo.externalAdReply.title = linkData[0] || '';
        options.contextInfo.externalAdReply.body = linkData[1] || '';
        options.contextInfo.externalAdReply.sourceUrl = extractUrlsFromString(config.LINK_PREVIEW)[0] || '';
    }

    // Send message based on theme
    if (theam === 'text') {
        return await m.client.sendMessage(m.jid, {
            text: menu,
            ...options
        });
    } else {
        return await m.client.sendMessage(m.from, {
            [theam]: { url: img_url },
            caption: menu,
            ...options
        });
    }
}

async function send_alive(m, ALIVE_DATA,obj) {
	const sstart = new Date().getTime();
	let msg = {
		contextInfo: {}
	}
	let extractions = ALIVE_DATA.match(/#(.*?)#/g);
	let URLS;
	if (extractions) {
		ALIVE_DATA = ALIVE_DATA.replace(/#([^#]+)#/g, '');
		extractions = extractions.map(m => m.slice(1, -1));
		let arra = [];
		URLS = MediaUrls(ALIVE_DATA);
		msg.contextInfo.externalAdReply = {
			containsAutoReply: true,
			mediaType: 1,
			previewType: "PHOTO"
		};
		extractions.map(extraction => {
			extraction = extraction.replace('\\', '');
			if (extraction.match(/adattribution/gi)) msg.contextInfo.externalAdReply.showAdAttribution = true;
			if (extraction.match(/adreply/gi)) msg.contextInfo.externalAdReply.showAdAttribution = true;
			if (extraction.match(/largerthumbnail/gi)) msg.contextInfo.externalAdReply.renderLargerThumbnail = true;
			if (extraction.match(/largethumb/gi)) msg.contextInfo.externalAdReply.renderLargerThumbnail = true;
			if (extraction.match(/title/gi)) msg.contextInfo.externalAdReply.title = extraction.replace(/title/gi, '');
			if (extraction.match(/body/gi)) msg.contextInfo.externalAdReply.body = extraction.replace(/body/gi, '');
			if (extraction.match(/thumbnail/gi) && !extraction.match(/largerthumbnail/gi)) msg.contextInfo.externalAdReply.thumbnailUrl = extraction.replace(/thumbnail/gi, '');
			if (extraction.match(/thumb/gi) && !extraction.match(/largerthumbnail/gi) && !extraction.match(/largethumb/gi) && !extraction.match(/thumbnail/gi)) msg.contextInfo.externalAdReply.thumbnailUrl = extraction.replace(/thumb/gi, '');
			if (extraction.match(/sourceurl/gi)) msg.contextInfo.externalAdReply.sourceUrl = extraction.replace(/sourceurl/gi, '');
			if (extraction.match(/mediaurl/gi)) msg.contextInfo.externalAdReply.mediaUrl = extraction.replace(/mediaurl/gi, '');
		});
	} else {
		URLS = MediaUrls(ALIVE_DATA);
	}
	let date = new Date().toLocaleDateString("EN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	const URL = URLS[Math.floor(Math.random() * URLS.length)];
	const platform = os.platform();
	const sender = m.sender;
	const user = m.pushName;
	let text = ALIVE_DATA.replace(/&ram/gi, format(os.totalmem() - os.freemem())).replace(/&sender/gi, `@${sender.replace(/[^0-9]/g,'')}`).replace(/&user/gi, `${user}`).replace(/&version/gi, `${packageJson}`).replace(/&prefix/gi, `${PREFIX}`).replace(/&mode/gi, `${WORKTYPE}`).replace(/&platform/gi, `${platform}`).replace(/&date/gi, `${date}`).replace(/&speed/gi, `${sstart-new Date().getTime()}`).replace(/&gif/g, '');
	if (ALIVE_DATA.includes('&sender')) msg.contextInfo.mentionedJid = [sender];
	if (ALIVE_DATA.includes('&gif')) msg.gifPlayback = true;
	if (URL && URL.endsWith('.mp4')) {
		msg.video = {
				url: URL
			},
			msg.caption = URLS.map(url => text = text.replace(url, ''));

	} else if (URL) {
		msg.image = {
				url: URL
			},
			msg.caption = URLS.map(url => text = text.replace(url, ''));

	} else msg.text = text.trim();
	return await m.client.sendMessage(m.jid, msg);
}

async function poll(id) {
	if (!fs.existsSync('./lib/database/poll.json')) return {
		status: false
	}
	const file = JSON.parse(fs.readFileSync('./lib/database/poll.json'));
	const poll_res = file.message.filter(a => id.key.id == Object.keys(a)[0]);
	if (!poll_res[0]) return {
		status: false
	}
	let options = {}
	const vote_id = Object.keys(poll_res[0]);
	const vote_obj = Object.keys(poll_res[0][vote_id].votes);
	let total_votes = 0;
	vote_obj.map(a => {
		options[a] = {
			count: poll_res[0][vote_id].votes[a].length
		};
		total_votes = total_votes + poll_res[0][vote_id].votes[a].length
	});
	const keys = Object.keys(options);
	keys.map(a => options[a].percentage = (options[a].count / total_votes) * 100 + '%');
	return {
		status: true,
		res: options,
		total: total_votes
	}
}
module.exports = {
	isInstagramURL,
	linkPreview,
	AudioMetaData,
	addSpace,
	sendUrl,
	send_menu,
	send_alive,
	poll,
	getRandom,
	getBuffer,
	fetchJson,
	runtime,
	sleep,
	isUrl,
	bytesToSize,
	getSizeMedia
};