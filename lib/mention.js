const { MediaUrls } = require('./handler');

async function mention(m, text) {
	const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];
	const jsonArray = text.match(/{.*}/g);
	let msg = text.replace(jsonArray, '');
	let type = 'text',
		message = {
			contextInfo: {}
		};

	// Determine message type
	for (const mediaType of types) {
		if (msg.includes(mediaType)) {
			type = mediaType.replace('type/', '');
			break;
		}
	}

	// Parse JSON if found
	if (jsonArray) {
		try {
			message = JSON.parse(jsonArray[0]);
		} catch (error) {
			console.error("Invalid JSON format:", error);
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

	// Process media URLs
	let URLS = MediaUrls(msg) || [];
	if (type !== 'text' && URLS.length > 0) {
		URLS.forEach(url => msg = msg.replace(url, ''));
		msg = msg.replace('type/', '').replace(type, '').replace(/,/g, '').trim();

		let URL = URLS[Math.floor(Math.random() * URLS.length)];

		switch (type) {
			case 'image':
				message.mimetype = 'image/jpeg';
				message.image = { url: URL };
				break;
			case 'video':
				message.mimetype = 'video/mp4';
				message.video = { url: URL };
				break;
			case 'audio': // **Fix for voice notes**
				message.mimetype = 'audio/ogg; codecs=opus';
				message.ptt = true; // **Mark as voice note**
				message.waveform = Array.from({ length: 40 }, () => Math.floor(Math.random() * 99)); // **Random waveform**
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
		}
		return await m.client.sendMessage(m.jid, message);
	}

	// Handle text message
	if (msg.includes('&sender') && m.sender) {
		msg = msg.replace('&sender', '@' + m.sender);
		message.contextInfo.mentionedJid = [m.sender];
	}

	message.text = msg;
	return await m.client.sendMessage(m.jid, message);
}

module.exports = {
	mention
};