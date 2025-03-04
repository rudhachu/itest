const { plugin, mode, runtime } = require("../lib/");

plugin({
    pattern: "uptime",
    type: "info",
    desc: "Shows bot uptime.",
    fromMe: mode,
  },
  async (message, match) => {
    const upt = runtime(process.uptime());
    const uptt = `Beep boop... System status: Fully operational!\n*Current uptime: ${upt}*`;

    // Ensure 'info' exists
    const info = match || ""; 
    const parts = info.split(';');

    let fileType = 'unknown';
    const mediaUrl = parts[2] || ''; // Ensure a valid string

    if (mediaUrl.endsWith('.jpg') || mediaUrl.endsWith('.png')) {
      fileType = 'image';
    } else if (mediaUrl.endsWith('.mp4')) {
      fileType = 'video';
    }

    if (fileType === 'image') {
      await message.send({ url: mediaUrl }, { caption: uptt }, "image");
    } else if (fileType === 'video') {
      await message.send({ url: mediaUrl }, { caption: uptt }, "video");
    } else {
      await message.reply(uptt);
    }
  });
  
plugin({
    pattern: 'ping ?(.*)',
    desc: 'check bot speed',
    react: "💯",
    fromMe: mode,
    type: 'info'
}, async (message, match) => {
    const start = new Date().getTime()
    const msg = await message.send('Testing Ping!')
    const end = new Date().getTime()
    return await msg.edit('*⚡Pong!* ' + (end - start) + ' ms');
});
