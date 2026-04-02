const { Keyboard } = require('@maxhub/max-bot-api');

const BUTTONS = {
  services: '📸 О нас',
  works: '🖼 Портфолио',
  price: '💼 Тарифы',
  contacts: '📞 Контакты',
  resources: '🌐 Сайт и проекты',
  contactOwner: '💬 Запросить консультацию',
  back: '← Главное меню',
};

const REGIONS = {
  moscow: {
    id: 'main',
    displayName: 'Москвы',
    callbackData: 'region_moscow',
    label: '📍 Москва',
  },
  moscowRegion: {
    id: 'main',
    displayName: 'Московской области',
    callbackData: 'region_mo',
    label: '📍 Московская область',
  },
  zernograd: {
    id: 'zernograd',
    displayName: 'Зернограда',
    callbackData: 'region_zernograd',
    label: '📍 Зерноград',
  },
};

const keyboards = {
  startInlineMenu: Keyboard.inlineKeyboard([
    [Keyboard.button.callback('✨ Начать знакомство', 'start_intro')],
  ]),

  regionMenu: Keyboard.inlineKeyboard([
    [Keyboard.button.callback(REGIONS.moscow.label, REGIONS.moscow.callbackData)],
    [Keyboard.button.callback(REGIONS.moscowRegion.label, REGIONS.moscowRegion.callbackData)],
    [Keyboard.button.callback(REGIONS.zernograd.label, REGIONS.zernograd.callbackData)],
  ]),

  mainMenu: Keyboard.inlineKeyboard([
    [
      Keyboard.button.callback(BUTTONS.services, 'services'),
      Keyboard.button.callback(BUTTONS.works, 'works'),
    ],
    [
      Keyboard.button.callback(BUTTONS.price, 'price'),
      Keyboard.button.callback(BUTTONS.contacts, 'contacts'),
    ],
    [Keyboard.button.callback(BUTTONS.resources, 'resources')],
  ]),

  backMenu: Keyboard.inlineKeyboard([[Keyboard.button.callback(BUTTONS.back, 'back')]]),

  backWithContactMenu: Keyboard.inlineKeyboard([
    [Keyboard.button.callback(BUTTONS.contactOwner, 'contact_owner')],
    [Keyboard.button.callback(BUTTONS.back, 'back')],
  ]),

  worksInlineLinks: Keyboard.inlineKeyboard([
    [Keyboard.button.link('📱 Telegram-канал', 'https://t.me/mosalbum')],
    [Keyboard.button.link('📸 MAX-канал', 'https://max.ru/join/zUPzdbO-Se9dSMt7oZRJOyjoUvYTNvXQXsT6yWyMf1Y')],
    [Keyboard.button.link('💬 Моя ВК-страница', 'https://vk.com/denisenko.tatyana')],
  ]),

  contactsInlineLinks: Keyboard.inlineKeyboard([
    [Keyboard.button.link('💬 Написать в Telegram', 'https://t.me/tataprophoto')],
    [Keyboard.button.link('🌐 Открыть сайт', 'https://denisenko.info/')],
  ]),

  resourcesInlineLinks: Keyboard.inlineKeyboard([
    [Keyboard.button.link('🌐 denisenko.info', 'https://denisenko.info/')],
    [Keyboard.button.link('📱 Telegram-канал', 'https://t.me/mosalbum')],
    [Keyboard.button.link('📱 MAX-канал Mosalbum', 'https://max.ru/join/zUPzdbO-Se9dSMt7oZRJOyjoUvYTNvXQXsT6yWyMf1Y')],
    [Keyboard.button.link('💬 VK - Моя страница', 'https://vk.com/denisenko.tatyana')],
  ]),
};

module.exports = { BUTTONS, REGIONS, keyboards };

