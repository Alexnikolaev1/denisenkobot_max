const fs = require('fs');
const path = require('path');
const { ImageAttachment } = require('@maxhub/max-bot-api');

const START_NAME = 'main.jpg';
const CONTACTS_NAME = 'main2.jpg';

function resolvePaths(fileName) {
  return {
    publicPath: path.join(process.cwd(), 'public', fileName),
    rootPath: path.resolve(process.cwd(), fileName),
  };
}

function toImageAttachmentInput(data) {
  if (!data || typeof data !== 'object') return null;
  if (data.url) return { url: data.url };
  if (data.token) return { token: data.token };
  if (data.photos && typeof data.photos === 'object') return { photos: data.photos };
  return null;
}

function isValidImageAttachmentJson(json) {
  if (!json || json.type !== 'image' || !json.payload || typeof json.payload !== 'object') {
    return false;
  }
  const p = json.payload;
  if (Object.keys(p).length === 0) return false;
  if (p.token && String(p.token).length > 0) return true;
  if (p.url && String(p.url).length > 0) return true;
  if (p.photos && typeof p.photos === 'object') {
    const keys = Object.keys(p.photos);
    if (keys.length === 0) return false;
    return keys.some((k) => {
      const ph = p.photos[k];
      return ph && typeof ph === 'object' && ph.token && String(ph.token).length > 0;
    });
  }
  return false;
}

function buildImageJsonFromInput(input) {
  if (!input) return null;
  try {
    const image = new ImageAttachment(input);
    const json = image.toJson();
    return isValidImageAttachmentJson(json) ? json : null;
  } catch {
    return null;
  }
}

/**
 * На Vercel файл в корне деплоя не доступен по HTTPS; для URL-загрузки положите картинки в `public/`.
 */
async function tryUploadImageFromPublicUrl(ctx, fileName) {
  const base = process.env.VERCEL_URL;
  if (!base) return null;
  const { publicPath } = resolvePaths(fileName);
  if (!fs.existsSync(publicPath)) return null;
  try {
    const url = `${base.replace(/\/$/, '')}/${fileName}`;
    const raw = await ctx.api.upload.image({ url });
    const input = toImageAttachmentInput(raw);
    return buildImageJsonFromInput(input);
  } catch (err) {
    console.error('[photo-upload-url]', fileName, err.message || err);
    return null;
  }
}

async function tryUploadImageFromFile(ctx, filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = await ctx.api.upload.image({ source: filePath });
    const out = { ...raw };
    if ('token' in out && !out.token) delete out.token;
    const input = toImageAttachmentInput(out) || toImageAttachmentInput(raw);
    return buildImageJsonFromInput(input);
  } catch (err) {
    console.error('[photo-upload-file]', filePath, err.message || err);
    return null;
  }
}

async function uploadPhotoIfExists(ctx, fileName) {
  const { publicPath, rootPath } = resolvePaths(fileName);

  // 1) Публичный URL того же деплоя — самый стабильный вариант на Vercel.
  const fromUrl = await tryUploadImageFromPublicUrl(ctx, fileName);
  if (fromUrl) return fromUrl;

  // 2) Загрузка с диска: сначала public/, затем корень репозитория.
  const fromPublic = await tryUploadImageFromFile(ctx, publicPath);
  if (fromPublic) return fromPublic;

  const fromRoot = await tryUploadImageFromFile(ctx, rootPath);
  if (fromRoot) return fromRoot;

  if (!fs.existsSync(publicPath) && !fs.existsSync(rootPath)) {
    console.warn(`[photo-missing] нет файла: public/${fileName} или ./${fileName}`);
  }
  return null;
}

async function getStartPhotoAttachment(ctx) {
  return uploadPhotoIfExists(ctx, START_NAME);
}

async function getContactsPhotoAttachment(ctx) {
  return uploadPhotoIfExists(ctx, CONTACTS_NAME);
}

module.exports = {
  getStartPhotoAttachment,
  getContactsPhotoAttachment,
  isValidImageAttachmentJson,
};
