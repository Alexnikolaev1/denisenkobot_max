const bot = require('../src/max/bot');
const { getEnv } = require('../src/config/env');

async function ensureBotInfo() {
  if (!bot.botInfo) {
    bot.botInfo = await bot.api.getMyInfo();
  }
}

function isValidWebhookSecret(req, expected) {
  if (!expected) {
    return true;
  }
  // MAX passes the secret in this header for webhook requests.
  const actual = req.headers['x-max-bot-api-secret'];
  return actual === expected;
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    res.status(200).json({
      status: 'ok',
      service: 'denisenko-bot',
      build: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      handler: 'max-text-only',
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { webhookSecret } = getEnv();
    const expectedSecret = process.env.MAX_WEBHOOK_SECRET || webhookSecret;

    if (!isValidWebhookSecret(req, expectedSecret)) {
      res.status(401).json({ ok: false, error: 'Invalid webhook secret' });
      return;
    }

    await ensureBotInfo();
    await bot.handleUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[webhook-error]', error);
    res.status(500).json({ ok: false, error: 'Webhook handler failed' });
  }
};
