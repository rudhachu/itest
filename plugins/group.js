const {
	plugin,
	isAdmin,
	isBotAdmin,
	linkPreview,
	config
} = require('../lib');


plugin({
	pattern: 'promote ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'promote group member'
}, async (message, match) => {
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!message.reply_message.sender) return message.send('*Please reply to a user*', {
		linkPreview: linkPreview()
	});
	await message.client.groupParticipantsUpdate(message.jid,
		[message.reply_message.sender], "promote");
	message.send(`*@${message.reply_message.sender.split('@')[0]} Promoted as admin*`, {
		mentions: [message.reply_message.sender],
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'demote ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: "Demote group member"
}, async (message, match) => {
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!message.reply_message.sender) return message.send('*Please reply to a user*', {
		linkPreview: linkPreview()
	});
	await message.client.groupParticipantsUpdate(message.jid,
		[message.reply_message.sender], "demote");
	return await message.send(`*@${message.reply_message.sender.split('@')[0]} Demoted From Admin*`, {
		mentions: [message.reply_message.sender],
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'kick ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: "kick group member"
}, async (message, match) => {
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	let user = message.reply_message.sender || match;
	if (!user) return await message.send('*Please reply to a user*', {
		linkPreview: linkPreview()
	})
	user = user.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
	if (match != "all") {
		if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
		if (!config.ADMIN_ACCESS && !message.isCreator) return;
		if (!admin && !message.isCreator) return;
		await message.client.groupParticipantsUpdate(message.jid,
			[user], "remove");
		return await message.send(`*@${user.split('@')[0]} kick from group*`, {
			mentions: [user],
			linkPreview: linkPreview()
		});
	} else if (match.toLowerCase() == 'all') {
		if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
		if (!config.ADMIN_ACCESS && !message.isCreator) return;
		if (!admin && !message.isCreator) return;
		const groupMetadata = await message.client.groupMetadata(message.jid).catch(e => {})
		const participants = await groupMetadata.participants;
		let admins = await participants.filter(v => v.admin !== null).map(v => v.id);
		participants.filter((U) => !U.admin == true).map(({
			id
		}) => id).forEach(async (k) => {
			await sleep(250);
			await message.client.groupParticipantsUpdate(message.jid,
				[k], "remove");
		});
		return await message.reply('_All group Participants will been kicked!_')
	}
});

plugin({
	pattern: 'revoke ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'revoke group link'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupRevokeInvite(message.jid);
	return await message.send('*Successfully revoked group link*', {
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'invite ?(.*)',
	type: 'group',
	onlyGroup: true,
	fromMe: true,
	desc: 'get group link'
}, async (message, match) => {
	if (!await isBotAdmin(message)) return await message.send('_bot must be admin first_', {
		linkPreview: linkPreview()
	})
	const code = await message.client.groupInviteCode(message.jid);
	return await message.send(`https://chat.whatsapp.com/${code}`, {
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'lock ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'change group privacy to only admins edit'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupSettingUpdate(message.jid, "locked");
	return await message.reply('*Group Settings Locked*')
});

plugin({
	pattern: 'unlock ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'change group privacy to members can edit'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupSettingUpdate(message.jid, "unlocked");
	return await message.reply('*Group Settings Unlocked*')
});

plugin({
	pattern: 'mute ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'change group privacy to only admins edit'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupSettingUpdate(message.jid, "announcement");
	return await message.send('*Group Muted!*', {
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'unmute ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'unmute a group'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	await message.client.groupSettingUpdate(message.jid, "not_announcement");
	return await message.send('*Group Unmuted!*', {
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'gdesc ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'update group description'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (message.text > 400) return await message.send('*Can`t be updated*', {
		linkPreview: linkPreview()
	})
	let txt = match || " ";
	await message.client.groupUpdateDescription(message.jid, txt);
	return await message.send('*Updated successfully*', {
		linkPreview: linkPreview()
	})
});


plugin({
	pattern: 'gname ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'Update group name'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (message.text > 75) return await message.send('*Can`t be updated*', {
		linkPreview: linkPreview()
	})
	let txt = message.text || " ";
	await message.client.groupUpdateSubject(message.jid, txt);
	return await message.send('*Group name updated*', {
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'left ?(.*)',
	type: 'group',
	onlyGroup: true,
	desc: 'left from group',
	fromMe: true
}, async (message, match) => {
	await message.client.groupLeave(message.jid)
});

plugin({
	pattern: 'gpp ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'Update group icon'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!message.reply_message.image) return await message.send('*Please reply to a image message*');
	let _message = message.reply_message.imageMessage;
	let download = await message.client.downloadMediaMessage(_message);
	await message.client.updateProfilePicture(message.jid, download);
	return message.send('*Group profile updated*', {
		linkPreview: linkPreview()
	})
})

plugin({
	pattern: 'fullgpp ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: 'Update group icon'
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (!message.reply_message.image) return await message.send('*Please reply to a image message*');
	let download = await message.reply_message.download();
	await message.updateProfilePicture(message.jid, download);
	return message.send('*Profile photo updated*', {
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'join ?(.*)',
	type: 'owner',
	fromMe: true,
	desc: 'join a group using group link'
}, async (message, match) => {
	if (!match || !match.match(/^https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9]/)) return await message.send('*invalid url*', {
		linkPreview: linkPreview()
	});
	let urlArray = (match).trim().split('/');
	if (!urlArray[2] == 'chat.whatsapp.com') return await message.send('Url must be a whatsapp group link*', {
		linkPreview: linkPreview()
	})
	const response = await message.client.groupAcceptInvite(urlArray[3]);
	return await message.send('*Successfully joind!*', {
		linkPreview: linkPreview()
	})
});

plugin({
	pattern: 'add ?(.*)',
	type: 'group',
	fromMe: true,
	onlyGroup: true,
	desc: "add member's to group"
}, async (message, match) => {
	const BotAdmin = await isBotAdmin(message);
	const admin = await isAdmin(message);
	match = message.reply_message.sender || match;
	if (!match) return await message.send('*Please reply to a user*');
	match = match.replaceAll(' ', '');
	if (!BotAdmin) return await message.send('*Bot must be admin first*', {
		linkPreview: linkPreview()
	})
	if (!config.ADMIN_ACCESS && !message.isCreator) return;
	if (!admin && !message.isCreator) return;
	if (match) {
		let users = match.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let info = await message.client.onWhatsApp(users);
		ex = info.map((jid) => jid.jid);
		if (!ex.includes(users)) return await message.send('*User not in whatsapp*');
		const su = await message.client.groupParticipantsUpdate(message.jid,
			[users], "add");
		if (su[0].status == 403) {
			message.send('*Couldn\'t add. Invite sent!*');
			return await message.sendGroupInviteMessage(users);
		} else if (su[0].status == 408) {
			await message.send("*Couldn\'t add because they left the group recently. Try again later.*", {
				linkPreview: linkPreview()
			})
			const code = await message.client.groupInviteCode(message.jid);
			return await message.client.sendMessage(users, {text: `https://chat.whatsapp.com/${code}`})
		} else if (su[0].status == 401) {
			await message.send('*Couldn\'t add because they blocked the bot number.*', {
				linkPreview: linkPreview()
			})
		} else if (su[0].status == 200) {
			return await message.send(`*@${users.split('@')[0]} Added to the group.*`, {
				mentions: [users],
				linkPreview: linkPreview()
			})
		} else if (su[0].status == 409) {
			return await message.send("*Already in the group.*", {
				mentions: [users],
				linkPreview: linkPreview()
			})
		} else {
			return await message.send(JSON.stringify(su));
		}
	}
});

plugin({
	pattern: 'ginfo ?(.*)',
	fromMe: true,
	desc: 'Shows group invite info',
	type: 'group'
}, async (message, match) => {
	match = match || message.reply_message.text
	if (!match) return await message.reply('*Need Group Link*\n_Example : ginfo group link_')
	const [link, invite] = match.match(/chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i) || []
	if (!invite) return await message.reply('*Invalid invite link*')
	try {
		const response = await message.client.groupGetInviteInfo(invite)
		await message.send("id: " + response.id + "\nsubject: " + response.subject + "\nowner: " + `${response.owner ? response.owner.split('@')[0] : 'unknown'}` + "\nsize: " + response.size + "\nrestrict: " + response.restrict + "\nannounce: " + response.announce + "\ncreation: " + require('moment-timezone')(response.creation * 1000).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm:ss') + "\ndesc" + response.desc)
	} catch (error) {
		await message.reply('*Invalid invite link*')
	}
})