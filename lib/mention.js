const fs = require('fs').promises;
const { exec } = require('child_process');
const { MediaUrls, toPTT } = require('./handler');
const { getBuffer } = require("./functions");

async function mention(m, text) {
  const types = ['type/image', 'type/video', 'type/audio', 'type/sticker', 'type/gif'];
  const jsonArray = text.match(/({.*})/g);
  let msg = text.replace(jsonArray, '');
  let type = 'text';
  let message = {
    contextInfo: {}
  };

  // Detect media type (image, video, audio, sticker, gif)
  for (const i in types) {
    if (msg.match(types[i])) {
      type = msg.match(types[i])[0].replace('type/', '');
      break;
    }
  }

  // If JSON is found, parse it
  if (jsonArray) {
    message = JSON.parse(jsonArray[0]);
  }

  // Add external ad reply info if available in the message
  if (message.linkPreview) {
    message.contextInfo = message.contextInfo || {};
    message.contextInfo.externalAdReply = message.linkPreview;
  }

  // Adjust external ad thumbnail URL if exists
  if (message.contextInfo?.externalAdReply?.thumbnail) {
    message.contextInfo.externalAdReply.thumbnailUrl = message.contextInfo?.externalAdReply?.thumbnail;
    delete message.contextInfo.externalAdReply.thumbnail;
  }

  // Remove linkPreview property
  delete message.linkPreview;

  // Extract media URLs
  let URLS = MediaUrls(msg);

  // Handle media types and send appropriate message
  if (type !== 'text' && URLS[0]) {
    // Remove media URLs from the message text
    URLS.forEach(url => {
      msg = msg.replace(url, '');
    });

    // Clean up message text
    msg = msg.replace('type/', '').replace(type, '').replace(/,/g, '').trim();
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
      const buff = await getBuffer(URLS);
      const audio = await toPTT(buff, 'opus');
      return await m.client.sendMessage(m.jid, { audio: audio, ...options });
    } else if (type === 'sticker') {
      message.mimetype = 'image/webp';
      return await m.sendSticker(m.jid, URL, message);
    } else if (type === 'gif') {
      message.gifPlayback = true;
      message.video = { url: URL };
      return await m.client.sendMessage(m.jid, message);
    }
  } else {
    // Handle text message with sender mention
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
