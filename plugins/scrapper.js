const {
    plugin,
    mode,
    weather,
    ringtone,
    GenListMessage,
    getJson,
    config
} = require('../lib');


plugin({
    pattern: 'ringtone',
    fromMe: mode,
    desc: 'download ringtone',
    react : "🙃",
    type: "search"
}, async (message, match) => {
        if (!match) return message.send('_give me some query_');
        let result = await ringtone(match), res=[];
        await result.map(r=>res.push(r.title));
        return await message.send(GenListMessage('LIST OF RINGTONES', res));
});
