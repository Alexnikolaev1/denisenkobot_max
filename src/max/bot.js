const { Bot } = require('@maxhub/max-bot-api');
const { getEnv } = require('../config/env');
const { createMemorySession } = require('./middlewares/memorySession');
const { registerHandlers } = require('./handlers/registerHandlers');
const { MESSAGES } = require('../content/messages');

let botSingleton;

function createMaxBot() {
  const { botToken } = getEnv();
  const bot = new Bot(botToken);

  bot.use(createMemorySession({ ttlMs: 1000 * 60 * 60 * 12, cleanupEvery: 300 }));

  registerHandlers(bot);

  bot.catch(async (error, ctx) => {
    console.error('[max-bot-error]', error);
    if (typeof ctx?.reply === 'function') {
      await ctx.reply(MESSAGES.commonError);
    }
  });

  return bot;
}

function getBot() {
  if (!botSingleton) {
    botSingleton = createMaxBot();
  }
  return botSingleton;
}

module.exports = getBot;
module.exports.createBot = createMaxBot;
module.exports.getBot = getBot;
