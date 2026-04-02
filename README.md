# MAX-бот «Фотостудия Денисенко»

Продакшн-ориентированный бот для мессенджера MAX на `@maxhub/max-bot-api`: меню/контент — как в Telegram-версии, а состояние пользователя хранится в in-memory с TTL.

## Структура проекта

```text
denisenko-bot/
├── api/
│   └── webhook.js                 # Vercel serverless endpoint (MAX Webhook)
├── scripts/
│   └── set-subscriptions-max.js  # POST /subscriptions для MAX
├── src/
│   └── content/
│       └── messages.js            # HTML-контент и тексты
├── src/max/
│   ├── bot.js                     # Инициализация MAX Bot
│   ├── handlers/
│   │   └── registerHandlers.js  # Роутинг команд/кнопок
│   ├── middlewares/
│   │   └── memorySession.js     # In-memory сессии + TTL cleanup
│   ├── ui/
│   │   └── keyboards.js         # Inline клавиатуры и payload'ы
│   └── utils/
│       └── sendImages.js        # uploadImage + кэш вложений
├── max-local.js                   # Локальный long polling запуск
├── vercel.json
├── .env.example
└── package.json
```

## Переменные окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Обязательные:
- `BOT_TOKEN`

Опциональные:
- `VERCEL_URL` (нужен для `npm run set-subscriptions`)
- `MAX_WEBHOOK_SECRET` (рекомендуется для защиты MAX webhook)

## Локальный запуск

```bash
npm install
npm start
```

Проверка корректности модулей:

```bash
npm run check
```

## Деплой на Vercel
1. Добавьте в Vercel Environment Variables:
   - `BOT_TOKEN`
   - `VERCEL_URL` (нужен для `npm run set-subscriptions`)
   - `MAX_WEBHOOK_SECRET` (рекомендуется)
2. Выполните деплой:

```bash
vercel deploy --prod
```

3. Зарегистрируйте subscriptions для MAX:

```bash
npm run set-subscriptions
```

MAX будет отправлять обновления на:
`https://<your-vercel-app>/api/webhook`

## Расширение бота

- Новые тексты: `src/content/messages.js`
- Новые inline-клавиатуры и payload'ы: `src/max/ui/keyboards.js`
- Новые сценарии: `src/max/handlers/registerHandlers.js`
- Новые middleware/утилиты: `src/max/middlewares/*`, `src/max/utils/*`
