const {
    plugin,
    groupDB,
    isAdmin,
    isBotAdmin,
    config
} = require('../lib');

plugin({
    pattern: 'warn ?(.*)',
    desc: 'Give warning to group members',
    react: '😑',
    type: 'action',
    fromMe: true,
    onlyGroup: true
}, async (message, match) => {
    if (!match && !message.reply_message.sender) return await message.send('Usage:\nwarn <reply to a user>\nresetwarn');

    if (match === 'get') {
        const { warn } = await groupDB(['warn'], { jid: message.jid, content: {} }, 'get');
        if (!Object.keys(warn).length) return await message.reply('_No warnings found!_');

        let msg = 'Warnings List:\n';
        for (const user in warn) {
            msg += `\n_*User:* @${user}_\n_*Count:* ${warn[user].count}_\n_*Remaining:* ${config.WARNCOUNT - warn[user].count}_\n`;
        }
        return await message.send(msg, { mentions: Object.keys(warn).map(u => `@${u}`), quoted: message });
    } 
    
    if (match === 'reset') {
        if (!message.reply_message.sender) return await message.send('Reply to a user to reset their warnings');
        
        const { warn } = await groupDB(['warn'], { jid: message.jid, content: {} }, 'get');
        if (!Object.keys(warn).includes(message.reply_message.number)) return await message.reply('_User not found!_');

        await groupDB(['warn'], { jid: message.jid, content: { id: message.reply_message.number } }, 'delete');
        return await message.reply('_Warnings reset successfully_');
    }

    const BotAdmin = await isBotAdmin(message);
    const admin = await isAdmin(message);
    
    if (!BotAdmin) return await message.reply('I am not an admin in this group.');
    if (config.ADMIN_ACCESS !== 'true' && !message.isCreator) return await message.reply('Request failed');
    if (!admin && !message.isCreator) return await message.reply('Request failed');
    if (!message.reply_message.sender) return await message.send('Reply to a user to warn them.');

    const reason = match || 'Violation of rules';
    const { warn } = await groupDB(['warn'], { jid: message.jid, content: {} }, 'get');
    
    const count = warn[message.reply_message.number] ? warn[message.reply_message.number].count + 1 : 1;
    const remaining = config.WARNCOUNT - count;

    await groupDB(['warn'], { jid: message.jid, content: { [message.reply_message.number]: { count } } }, 'add');

    let warnmsg = `╭───〔 *WARNING* 〕───•
│  *User:* @${message.reply_message.number}
│  *Reason:* ${reason}
│  *Warnings:* ${count}
│  *Remaining:* ${remaining}
╰──────────────•`;

    await message.send(warnmsg, { mentions: [`@${message.reply_message.number}`], quoted: message });

    if (remaining <= 0) {
        await groupDB(['warn'], { jid: message.jid, content: { id: message.reply_message.number } }, 'delete');
        if (BotAdmin) {
            await message.client.groupParticipantsUpdate(message.from, [message.reply_message.sender], 'remove');
            return await message.reply('Max warnings reached, user removed.');
        }
    }
});