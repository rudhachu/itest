const { plugin, mode, linkPreview, runtime } = require("../lib/");

plugin({
    pattern: "uptime",
    type: "info",
    desc: "Shows bot uptime.",
    fromMe: mode,
  },
  async (message, match) => {
    const uptimeText = `*Current uptime: ${runtime(process.uptime())}*`;
    return await message.send(uptimeText, {
		linkPreview: linkPreview()
	})
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