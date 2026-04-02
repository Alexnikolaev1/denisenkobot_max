require('dotenv').config();

const { getEnv } = require('../src/config/env');

async function setSubscriptionsMax() {
  const { botToken, vercelUrl, webhookSecret } = getEnv();

  if (!vercelUrl) {
    throw new Error('Missing environment variable: VERCEL_URL');
  }

  const maxWebhookSecret = process.env.MAX_WEBHOOK_SECRET || webhookSecret || undefined;
  const webhookUrl = `${vercelUrl.replace(/\/$/, '')}/api/webhook`;

  const response = await fetch('https://platform-api.max.ru/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: botToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: webhookUrl,
      update_types: ['bot_started', 'message_created', 'message_callback'],
      secret: maxWebhookSecret,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`MAX subscriptions HTTP ${response.status}: ${text || 'no body'}`);
  }

  const result = await response.json().catch(() => ({}));
  if (result?.success === false) {
    throw new Error(result?.message || 'Unknown MAX subscriptions error');
  }

  console.log('✅ Subscriptions настроены для MAX бота');
  console.log(`📡 URL: ${webhookUrl}`);
  if (maxWebhookSecret) {
    console.log('🔐 Secret token включен');
  }
}

setSubscriptionsMax().catch((error) => {
  console.error('❌ Не удалось настроить subscriptions для MAX:', error.message);
  process.exit(1);
});

