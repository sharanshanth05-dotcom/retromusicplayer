const fs = require('fs/promises');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'db.json');

let cache = null;
let writeQueue = Promise.resolve();

async function load() {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    cache = JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      cache = { users: {} };
      await persist();
    } else {
      throw err;
    }
  }
  return cache;
}

async function persist() {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  // Write to a temp file then rename, so a crash mid-write can't leave a truncated db.json.
  const tmpPath = `${DB_PATH}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(cache, null, 2));
  await fs.rename(tmpPath, DB_PATH);
}

function enqueueWrite(mutator) {
  writeQueue = writeQueue.then(mutator).catch((err) => {
    console.error('Store write failed:', err);
    throw err;
  });
  return writeQueue;
}

async function getUser(id) {
  const db = await load();
  return db.users[id] || null;
}

async function saveUser(id, patch) {
  await load();
  return enqueueWrite(async () => {
    cache.users[id] = { ...cache.users[id], ...patch, id };
    await persist();
    return cache.users[id];
  });
}

module.exports = { getUser, saveUser };
