require('dotenv').config();

const bot = require('./src/max/bot');

console.log('🤖 MAX-бот запускается в режиме long polling...');
console.log('Нажмите Ctrl+C для остановки.\n');

bot
  .start({
    allowedUpdates: ['bot_started', 'message_created', 'message_callback'],
  })
  .then(() => {
    console.log('✅ MAX-бот запущен!');
  })
  .catch((err) => {
    console.error('❌ Ошибка запуска:', err?.message || err);
    process.exit(1);
  });

process.once('SIGINT', () => {
  console.log('\nОстановка...');
  bot.stop();
});
process.once('SIGTERM', () => {
  console.log('\nОстановка...');
  bot.stop();
});

