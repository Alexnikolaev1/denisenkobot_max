function createMemorySession(options = {}) {
  const ttlMs = options.ttlMs ?? 1000 * 60 * 60 * 24;
  const cleanupEvery = options.cleanupEvery ?? 500;
  let requestsCounter = 0;

  // In-memory store for Vercel function lifecycle (not persistent across cold starts).
  const store = new Map();

  function cleanupExpiredSessions(now) {
    for (const [key, value] of store.entries()) {
      if (now - value.updatedAt > ttlMs) {
        store.delete(key);
      }
    }
  }

  return async (ctx, next) => {
    // MAX: `ctx.user()` comes from update.message.sender or update.callback.user
    const userId = ctx.user?.user_id ?? ctx.user?.id ?? ctx.chatId;
    if (!userId) {
      return next();
    }

    const now = Date.now();
    requestsCounter += 1;
    if (requestsCounter % cleanupEvery === 0) {
      cleanupExpiredSessions(now);
    }

    const current = store.get(userId);
    if (current) {
      current.updatedAt = now;
      ctx.session = current.data;
    } else {
      const fresh = {};
      store.set(userId, { data: fresh, updatedAt: now });
      ctx.session = fresh;
    }

    return next();
  };
}

module.exports = { createMemorySession };

