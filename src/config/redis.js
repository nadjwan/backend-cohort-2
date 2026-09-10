const { createClient } = require("redis");

let client = null;
let connectPromise = null;

function buildRedisUrl() {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  const host = process.env.REDIS_HOST || "localhost";
  const port = process.env.REDIS_PORT || "6379";
  const username = process.env.REDIS_USERNAME;
  const password = process.env.REDIS_PASSWORD;
  const auth =
    username || password
      ? `${encodeURIComponent(username || "default")}:${encodeURIComponent(password || "")}@`
      : "";

  return `redis://${auth}${host}:${port}`;
}

function isRedisReady() {
  return Boolean(client && client.isOpen);
}

async function initializeRedis() {
  if (connectPromise) {
    return connectPromise;
  }

  client = createClient({
    url: buildRedisUrl(),
  });

  client.on("error", (error) => {
    console.warn(`Redis error: ${error.message}`);
  });

  connectPromise = client
    .connect()
    .then(() => {
      console.log("Redis cache connected");
      return client;
    })
    .catch((error) => {
      console.warn(`Redis cache disabled: ${error.message}`);
      client = null;
      connectPromise = null;
      return null;
    });

  return connectPromise;
}

async function getJson(key) {
  if (!isRedisReady()) {
    return null;
  }

  const value = await client.get(key);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    await client.del(key);
    return null;
  }
}

async function setJson(key, value, ttlSeconds) {
  if (!isRedisReady()) {
    return false;
  }

  const serializedValue = JSON.stringify(value);

  if (typeof ttlSeconds === "number" && ttlSeconds > 0) {
    await client.set(key, serializedValue, { EX: ttlSeconds });
  } else {
    await client.set(key, serializedValue);
  }

  return true;
}

async function deleteKeys(...keys) {
  if (!isRedisReady()) {
    return false;
  }

  const uniqueKeys = [...new Set(keys.filter(Boolean))];

  if (uniqueKeys.length === 0) {
    return false;
  }

  await Promise.all(uniqueKeys.map((key) => client.del(key)));
  return true;
}

module.exports = {
  deleteKeys,
  getJson,
  initializeRedis,
  isRedisReady,
  setJson,
};
