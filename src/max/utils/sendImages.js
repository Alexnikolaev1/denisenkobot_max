const fs = require('fs');
const path = require('path');
const { ImageAttachment } = require('@maxhub/max-bot-api');

const START_PHOTO_PATH = path.resolve(process.cwd(), 'main.jpg');
const CONTACTS_PHOTO_PATH = path.resolve(process.cwd(), 'main2.jpg');

let startPhotoAttachmentPromise;
let contactsPhotoAttachmentPromise;

function normalizeImageUploadResult(data) {
  if (!data || typeof data !== 'object') return null;
  const out = { ...data };
  // Ответ API иногда содержит ключ token без значения — ImageAttachment тогда
  // строит пустой payload (proto.payload: нет token/url/photos).
  if ('token' in out && !out.token) {
    delete out.token;
  }
  if (out.token || out.url) return out;
  if (out.photos && typeof out.photos === 'object') return out;
  return null;
}

function isValidImageAttachmentJson(json) {
  if (!json || json.type !== 'image' || !json.payload || typeof json.payload !== 'object') {
    return false;
  }
  const p = json.payload;
  if (p.token) return true;
  if (p.url) return true;
  if (p.photos && typeof p.photos === 'object' && Object.keys(p.photos).length > 0) {
    return true;
  }
  return false;
}

async function uploadPhotoIfExists(ctx, photoPath) {
  if (!fs.existsSync(photoPath)) {
    console.warn(`[photo-missing] ${photoPath}`);
    return null;
  }

  try {
    const raw = await ctx.api.upload.image({ source: photoPath });
    const normalized = normalizeImageUploadResult(raw);
    if (!normalized) {
      console.warn('[photo-upload-unrecognized]', JSON.stringify(raw));
      return null;
    }
    const image = new ImageAttachment(normalized);
    const json = image.toJson();
    if (!isValidImageAttachmentJson(json)) {
      console.warn('[photo-invalid-payload]', JSON.stringify(json));
      return null;
    }
    return json;
  } catch (err) {
    console.error('[photo-upload]', err);
    return null;
  }
}

async function getStartPhotoAttachment(ctx) {
  if (!startPhotoAttachmentPromise) {
    startPhotoAttachmentPromise = uploadPhotoIfExists(ctx, START_PHOTO_PATH);
  }
  return startPhotoAttachmentPromise;
}

async function getContactsPhotoAttachment(ctx) {
  if (!contactsPhotoAttachmentPromise) {
    contactsPhotoAttachmentPromise = uploadPhotoIfExists(ctx, CONTACTS_PHOTO_PATH);
  }
  return contactsPhotoAttachmentPromise;
}

module.exports = {
  getStartPhotoAttachment,
  getContactsPhotoAttachment,
};

