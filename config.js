const toBool = (x) => x == 'true';
const { existsSync } = require('fs');
const { Sequelize } = require('sequelize');

if (existsSync('config.env')) {
  require('dotenv').config({ path: './config.env' });
}

process.env.NODE_OPTIONS = '--max_old_space_size=2560'; // 2.5 GB memory limit
const DB_URL = process.env.DATABASE_URL || '';
global.ApiUrl = 'https://rudhra-web-server.onrender.com/'
global.WebUrl = 'https://rudhra-web-server.onrender.com/'

module.exports = {
  BRANCH: "main",
  ADMIN_ACCESS: toBool(process.env.ADMIN_ACCESS || "false"),
  API_TYPE: process.env.API_TYPE || 'all', // unique API type
  AUDIO_DATA: process.env.AUDIO_DATA || "RUDHRA-BOT;Ƥ ʀ ɪ ɴ ᴄ ᴇ  Ʀ ᴜ ᴅ ʜ;https://raw.githubusercontent.com/rudhra-prh/media/main/image/rudhra2.jpg",
  ANTI_CALL: process.env.ANTI_CALL || 'false', // true to block calls
  ALLWAYS_ONLINE: toBool(process.env.ALLWAYS_ONLINE || "false"),
  AJOIN: toBool(process.env.AJOIN || 'false'),
  BASE_URL: "https://rudhra-web-page.koyeb.app/",
  BGM_URL: process.env.BGM_URL || "null",
  BGMBOT: toBool(process.env.BGMBOT || "false"),
  BOT_INFO: process.env.BOT_INFO || "ʀᴜᴅʜʀᴀ ʙᴏᴛ;ʀᴜᴅʜʀᴀɴ;https://raw.githubusercontent.com/rudhra-prh/media/main/image/rudhra3.jpeg",
  BOT_PRESENCE: process.env.BOT_PRESENCE || "unavailable",
  BRAINSHOP: process.env.BRAINSHOP || '172352,vTmMboAxoXfsKEQQ&uid',
  CHATBOT: process.env.CHATBOT || "false", // true for chatbot in PM and group
  DISABLE_PM: toBool(process.env.DISABLE_PM || "false"),
  DISABLE_GRP: toBool(process.env.DISABLE_GRP || "false"),
  ERROR_MSG: toBool(process.env.ERROR_MSG || "true"),
  ELEVENLABS: process.env.ELEVENLABS,
  LIST_TYPE: process.env.LIST_TYPE || 'poll', // list or reaction
  LINK_PREVIEW: process.env.LINK_PREVIEW || '𝗥𝗨𝗗𝗛𝗥𝗔 𝗕𝗢𝗧;Ƥ ʀ ɪ ɴ ᴄ ᴇ  Ʀ ᴜ ᴅ ʜ;https://raw.githubusercontent.com/rudhraan/media/main/image/rudhra2.jpg', // You can use "false" also
  OPEN_AI: process.env.OPEN_AI,
  OCR_KEY: (process.env.OCR_KEY || 'K84003107488957').trim(),
  PREFIX: process.env.PREFIX || "[.,!]", // multi-prefix using [] (e.g., [.,!])
  PERSONAL_MESSAGE: process.env.PERSONAL_MESSAGE || "null",
  PORT: process.env.PORT || 3000,
  PM_BLOCK: process.env.PM_BLOCK || "false", // badword, all, spam:10 for spamming 10 block
  REPO: "princerudh/rudhra-bot",
  RMBG_KEY: process.env.RMBG_KEY,
  READ: process.env.READ || "false", // true to enable command reading
  REACT: process.env.REACT || "false", // true for command reactions with emoji
  STATUS_VIEW: process.env.STATUS_VIEW || "false",
  SAVE_STATUS: toBool(process.env.SAVE_STATUS || "false"),
  SESSION_ID: process.env.SESSION_ID || '', // Your session ID to run the bot
  STICKER_DATA: process.env.STICKER_DATA || "Ʀ ᴜ ᴅ ʜ ʀ λ;Ƥ ʀ ɪ ɴ ᴄ ᴇ  Ʀ ᴜ ᴅ ʜ",
  SUDO: process.env.SUDO || "null",
  WARNCOUND: process.env.WARNCOUND || 5,
  WORKTYPE: process.env.MODE || "private",
  HEROKU: {
    API_KEY: process.env.HEROKU_API_KEY,
    APP_NAME: process.env.HEROKU_APP_NAME
  },
  DATABASE: DB_URL ? new Sequelize(DB_URL, {
    dialect: 'postgres',
    ssl: true,
    protocol: 'postgres',
    dialectOptions: {
      native: true,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }) : new Sequelize({
    dialect: 'sqlite',
    storage: './database.db',
    logging: false
  })
};
