const fs = require('fs');
const path = require('path');

const START_PHOTO_PATH = path.resolve(process.cwd(), 'main.jpg');
const CONTACTS_PHOTO_PATH = path.resolve(process.cwd(), 'main2.jpg');

let startPhotoAttachmentPromise;
let contactsPhotoAttachmentPromise;

async function uploadPhotoIfExists(ctx, photoPath) {
  if (!fs.existsSync(photoPath)) {
    console.warn(`[photo-missing] ${photoPath}`);
    return null;
  }

  const image = await ctx.api.uploadImage({ source: photoPath });
  return image.toJson();
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

