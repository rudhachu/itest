const {
    plugin,
    groupDB,
    isAdmin
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
    if (!match && !message.reply_message.sender) return await message.send('warn <reply to a user>\nresetwarn');
    if (match == 'get') {
        const {
            warn
        } = await groupDB(['warn'], {
            jid: message.jid,
            content: {}
        }, 'get');
        if (!Object.keys(warn)[0]) return await message.reply('_Not Found!_');
        let msg = '';
        for (const f in warn) {
            msg += `_*User:* @${f}_\n_*Count:* ${warn[f].count}_\n_*Remaining:* ${config.WARNCOUND - warn[f].count}`;
        }
        return await message.send(msg, {mentions: [message.reply_message.sender], quoted: message });
    } else if (match == 'reset') {
        if (!message.reply_message.sender) return await message.send('reply to a user');
        const {
            warn
        } = await groupDB(['warn'], {
            jid: message.jid,
            content: {}
        }, 'get');
        if (!Object.keys(warn)[0]) return await message.reply('_Not Found!_');
        if (!Object.keys(warn).includes(message.reply_message.number)) return await message.reply('_User Not Found!_');
        await groupDB(['warn'], {
            jid: message.jid,
            content: {
                id: message.reply_message.number
            }
        }, 'delete');
        return await message.reply('_Warn reset Successfully_');
    } else {
        const BotAdmin = await isBotAdmin(message);
        const admin = await isAdmin(message);
        if (!BotAdmin) return await message.reply('Iam not group admin');
        if (config.ADMIN_SUDO_ACCESS != 'true' && !message.isCreator) return await message.reply('requst faild');
        if (!admin && !message.isCreator) return await message.reply('requst faild');
        if (!message.reply_message.sender) return await message.send('replt to a user');
        const reason = match || 'rules violation';
        const {
            warn
        } = await groupDB(['warn'], {
            jid: message.jid,
            content: {}
        }, 'get');
        const count = Object.keys(warn).includes(message.reply_message.number) ? Number(warn[message.reply_message.number].count) + 1 : 1;
        await groupDB(['warn'], {
                jid: message.jid,
                content: {
                    [message.reply_message.number]: {
                        count
                    }
                }
            },
            'add');
        const remains = config.WARNCOUND - count;
                let warnmsg = `╭───〔 *WARNING* 〕───•
│  User : @${message.reply_message.number}
├• Reason : ${reason}
├• Count : ${count}
├• Remaining : ${remains}
╰──────────────•`
        await message.send(warnmsg, {
            mentions: [message.reply_message.sender], quoted: message
        })
        if (remains <= 0) {
            await groupDB(['warn'], {
                jid: message.jid,
                content: {
                    id: message.reply_message.number
                }
            }, 'delete');
            if (BotAdmin) {
                await message.client.groupParticipantsUpdate(message.from, [message.reply_message.sender], 'remove');
                return await message.reply('max warm reached, user kicked')
            };
        };
    };
})
