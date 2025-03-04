const { plugin, mode, runtime } = require("../lib/");
const parts = info.split(';')

plugin({
      pattern: "uptime",
      type: "info",
      desc: "shows bot uptime.",
      fromMe: mode,
    },
    async (message, match) => {
      const upt = runtime(process.uptime());
      const uptt = `Beep boop... System status: Fully operational!\n*Current uptime: ${upt}*`;
  
      let fileType = 'unknown';
  
      if (parts[2].endsWith('.jpg') || parts[2].endsWith('.png')) {
        fileType = 'image';
      } else if (parts[2].endsWith('.mp4')) {
        fileType = 'video';
      } 
  
      if (fileType === 'image') {
        await message.send({ url: parts[2] }, { caption: uptt }, "image");
      } else if (fileType === 'video') {
        await message.sendReply(parts[2], { caption: uptt }, 'video');
      }
    },
  );
  
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
