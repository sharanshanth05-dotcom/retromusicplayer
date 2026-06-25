const store = new Map();

function set(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function del(key) {
  store.delete(key);
}

// wrap(key, ttlMs, fn) — returns the cached value if present and fresh,
// otherwise calls fn(), caches the result, and returns it.
async function wrap(key, ttlMs, fn) {
  const cached = get(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  set(key, value, ttlMs);
  return value;
}

module.exports = { get, set, del, wrap };
