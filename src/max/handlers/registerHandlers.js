const { REGIONS, keyboards } = require('../ui/keyboards');
const { MESSAGES } = require('../../content/messages');
const {
  getStartPhotoAttachment,
  getContactsPhotoAttachment,
  isValidImageAttachmentJson,
} = require('../utils/sendImages');

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getUserName(ctx) {
  // MAX: user data в `ctx.user` (getter).
  const raw = ctx.user?.name || 'дорогой гость';
  return escapeHtml(raw);
}

async function handleStart(ctx) {
  ctx.session.region = undefined;
  ctx.session.regionName = undefined;

  let startPhoto = null;
  try {
    startPhoto = await getStartPhotoAttachment(ctx);
  } catch (err) {
    console.error('[start-photo]', err);
  }

  const attachments = [];
  if (startPhoto && isValidImageAttachmentJson(startPhoto)) attachments.push(startPhoto);
  attachments.push(keyboards.startInlineMenu);

  await sendHtml(ctx, MESSAGES.start(getUserName(ctx)), { attachments });
}

function requireRegion(ctx, next) {
  if (!ctx.session?.region) {
    return ctx.reply(MESSAGES.regionRequired, { format: 'html' });
  }
  return next();
}

async function sendHtml(ctx, html, extra = {}) {
  return ctx.reply(html, {
    format: 'html',
    ...extra,
  });
}

async function handleRegion(ctx, region) {
  await ctx.answerOnCallback();
  ctx.session.region = region.id;
  ctx.session.regionName = region.displayName;

  await sendHtml(ctx, MESSAGES.regionAccepted(region.displayName), { attachments: [keyboards.mainMenu] });
}

function registerHandlers(bot) {
  // MAX при первом входе в чат шлёт `bot_started`, а не сообщение с текстом /start.
  bot.on('bot_started', handleStart);
  bot.command('start', handleStart);

  bot.action('start_intro', async (ctx) => {
    await ctx.answerOnCallback();
    await sendHtml(ctx, MESSAGES.chooseRegion, { attachments: [keyboards.regionMenu] });
  });

  bot.action(REGIONS.moscow.callbackData, (ctx) => handleRegion(ctx, REGIONS.moscow));
  bot.action(REGIONS.moscowRegion.callbackData, (ctx) => handleRegion(ctx, REGIONS.moscowRegion));
  bot.action(REGIONS.zernograd.callbackData, (ctx) => handleRegion(ctx, REGIONS.zernograd));

  bot.action('back', requireRegion, async (ctx) => {
    await ctx.answerOnCallback();
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.mainMenu] });
  });

  bot.action('services', requireRegion, async (ctx) => {
    await ctx.answerOnCallback();
    await sendHtml(ctx, MESSAGES.services, { attachments: [keyboards.backMenu] });
  });

  bot.action('works', requireRegion, async (ctx) => {
    await ctx.answerOnCallback();
    await sendHtml(ctx, MESSAGES.worksIntro);
    await sendHtml(ctx, MESSAGES.worksLinks, { attachments: [keyboards.worksInlineLinks] });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.action('price', requireRegion, async (ctx) => {
    await ctx.answerOnCallback();
    const isZernograd = ctx.session?.region === 'zernograd';
    await sendHtml(ctx, isZernograd ? MESSAGES.priceZernograd : MESSAGES.priceMain, { attachments: [keyboards.backWithContactMenu] });
  });

  bot.action('contact_owner', requireRegion, async (ctx) => {
    await ctx.answerOnCallback();
    const contactsPhoto = await getContactsPhotoAttachment(ctx);
    const attachments = [];
    if (contactsPhoto && isValidImageAttachmentJson(contactsPhoto)) attachments.push(contactsPhoto);
    attachments.push(keyboards.contactsInlineLinks);
    await sendHtml(ctx, MESSAGES.contactDirect, { attachments });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.action('contacts', requireRegion, async (ctx) => {
    await ctx.answerOnCallback();
    const contactsPhoto = await getContactsPhotoAttachment(ctx);
    const attachments = [];
    if (contactsPhoto && isValidImageAttachmentJson(contactsPhoto)) attachments.push(contactsPhoto);
    attachments.push(keyboards.contactsInlineLinks);
    await sendHtml(ctx, MESSAGES.contacts, { attachments });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.action('resources', requireRegion, async (ctx) => {
    await ctx.answerOnCallback();
    await sendHtml(ctx, MESSAGES.resources, { attachments: [keyboards.resourcesInlineLinks] });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.on('message_created', async (ctx) => {
    if (!ctx.session?.region) {
      await sendHtml(ctx, MESSAGES.unknownBeforeStart);
      return;
    }

    await sendHtml(ctx, MESSAGES.unknownInMenu, { attachments: [keyboards.mainMenu] });
  });
}

module.exports = { registerHandlers };

