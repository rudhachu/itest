const {
    plugin,
    groupDB,
    isBotAdmin,
    isAdmin,
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
    if (!match && !message.reply_message) {
        return await message.send('Usage: warn <reply to a user>\nTo reset warnings: warn reset');
    }

    const { warn } = await groupDB(['warn'], { jid: message.jid, content: {} }, 'get') || { warn: {} };
    
    if (match === 'get') {
        if (!Object.keys(warn).length) return await message.reply('_No warnings found!_');
        
        let msg = '*Warning List:*\n';
        for (const user in warn) {
            msg += `\n_*User:* @${user}_\n_*Count:* ${warn[user].count}_\n_*Remaining:* ${config.WARNCOUNT - warn[user].count}_\n`;
        }
        return await message.send(msg, { mentions: Object.keys(warn).map(u => `@${u}`) });
    
    } else if (match === 'reset') {
        if (!message.reply_message) return await message.send('Reply to a user to reset warnings.');

        const userNumber = message.reply_message.sender.split('@')[0];
        if (!warn[userNumber]) return await message.reply('_User has no warnings!_');

        await groupDB(['warn'], { jid: message.jid, content: { id: userNumber } }, 'delete');
        return await message.reply('_Warnings reset successfully._');

    } else {
        const BotAdmin = await isBotAdmin(message);
        const Admin = await isAdmin(message);
        
        if (!BotAdmin) return await message.reply('I am not a group admin.');
        if (config.ADMIN_ACCESS !== 'true' && !message.isCreator) return await message.reply('Request failed.');
        if (!Admin && !message.isCreator) return await message.reply('Request failed.');
        if (!message.reply_message) return await message.send('Reply to a user to warn.');

        const userNumber = message.reply_message.sender.split('@')[0];
        const reason = match || 'Violation of group rules';
        const count = warn[userNumber] ? warn[userNumber].count + 1 : 1;

        await groupDB(['warn'], {
            jid: message.jid,
            content: { [userNumber]: { count } }
        }, 'add');

        const remains = config.WARNCOUNT - count;
        let warnmsg = `╭───〔 *WARNING* 〕───•
│  *User:* @${userNumber}
├• *Reason:* ${reason}
├• *Count:* ${count}
├• *Remaining:* ${remains}
╰──────────────•`;

        await message.send(warnmsg, { mentions: [`@${userNumber}`] });

        if (remains <= 0) {
            if (BotAdmin) {
                await message.client.groupParticipantsUpdate(message.jid, [`${userNumber}@s.whatsapp.net`], 'remove');
                await groupDB(['warn'], { jid: message.jid, content: { id: userNumber } }, 'delete');
                return await message.reply('Max warnings reached. User removed.');
            } else {
                return await message.reply('Max warnings reached, but I am not an admin to remove the user.');
            }
        }
    }
});