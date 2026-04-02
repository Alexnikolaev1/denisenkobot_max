const { REGIONS, keyboards } = require('../ui/keyboards');
const { MESSAGES } = require('../../content/messages');
const { getStartPhotoAttachment, getContactsPhotoAttachment } = require('../utils/sendImages');

function getUserName(ctx) {
  // MAX: user data в `ctx.user` (getter).
  return ctx.user?.name || 'дорогой гость';
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

async function sendPhotoAttachmentIfExists(ctx, attachment) {
  if (!attachment) return;
  await ctx.reply('', { attachments: [attachment] });
}

async function handleRegion(ctx, region) {
  await ctx.answerOnCallback();
  ctx.session.region = region.id;
  ctx.session.regionName = region.displayName;

  await sendHtml(ctx, MESSAGES.regionAccepted(region.displayName), { attachments: [keyboards.mainMenu] });
}

function registerHandlers(bot) {
  bot.command('start', async (ctx) => {
    // Сбрасываем контекст выбора региона для нового знакомства.
    ctx.session.region = undefined;
    ctx.session.regionName = undefined;

    const startPhoto = await getStartPhotoAttachment(ctx);
    await sendPhotoAttachmentIfExists(ctx, startPhoto);
    await sendHtml(ctx, MESSAGES.start(getUserName(ctx)), { attachments: [keyboards.startInlineMenu] });
  });

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
    await sendPhotoAttachmentIfExists(ctx, contactsPhoto);
    await sendHtml(ctx, MESSAGES.contactDirect, { attachments: [keyboards.contactsInlineLinks] });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.action('contacts', requireRegion, async (ctx) => {
    await ctx.answerOnCallback();
    const contactsPhoto = await getContactsPhotoAttachment(ctx);
    await sendPhotoAttachmentIfExists(ctx, contactsPhoto);
    await sendHtml(ctx, MESSAGES.contacts, { attachments: [keyboards.contactsInlineLinks] });
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

