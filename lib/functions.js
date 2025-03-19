async function send_menu(m) {
    const img_url = config.BOT_INFO.split(";")[2];
    const readMore = String.fromCharCode(8206).repeat(4001);
    const date = new Date().toLocaleDateString("EN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // Basic bot info
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

    // Organizing commands by category
    let cmnd = [];
    let category = [];

    commands.forEach((command) => {
        if (command.pattern instanceof RegExp) {
            const cmd = String(command.pattern).split(/\W+/)[1];

            if (!command.dontAddCommandList && command.pattern) {
                let type = command.type ? command.type.toLowerCase() : "misc";
                cmnd.push({ cmd, type });

                if (!category.includes(type)) category.push(type);
            }
        }
    });

    // Sorting categories and commands
    category.sort().forEach((cmmd) => {
        menu += `\n┌───〈 *${cmmd.toUpperCase()}* 〉───◆`;
        menu += `\n│╭─────────────···▸`;
        menu += `\n┴│▸`;

        let comad = cmnd.filter(({ type }) => type == cmmd);
        comad.forEach(({ cmd }) => {
            menu += `\n⬡│▸  ${cmd.trim()}`;
        });

        menu += `\n┬│▸`;
        menu += `\n│╰────────────···▸▸`;
        menu += `\n└───────────────···▸`;
    });

    // Message options
    const options = {
        contextInfo: {
            mentionedJid: [m.sender]
        }
    };

    // Handling link preview
    if (config.LINK_PREVIEW && config.LINK_PREVIEW.toLowerCase() !== 'null' && config.LINK_PREVIEW.toLowerCase() !== 'false') {
        options.contextInfo.externalAdReply = {};
        const image = MediaUrls(config.LINK_PREVIEW);
        
        if (image[0]) {
            options.contextInfo.externalAdReply.thumbnailUrl = image[0];
        }

        const linkData = config.LINK_PREVIEW.split(/[,;|]/);
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