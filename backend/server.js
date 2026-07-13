const crypto = require('crypto');
const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

const port = Number(process.env.PORT || 3000);
const mongoUri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'passop-mongo';
const encryptionSecret = process.env.PASSWORD_ENCRYPTION_KEY;
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!mongoUri) {
  throw new Error('MONGO_URI is required');
}

if (!encryptionSecret || encryptionSecret.length < 32) {
  throw new Error('PASSWORD_ENCRYPTION_KEY must be at least 32 characters long');
}

const client = new MongoClient(mongoUri);
const encryptionKey = crypto.createHash('sha256').update(encryptionSecret).digest();

app.use(express.json({ limit: '16kb' }));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
  }),
);

function getCollection() {
  return client.db(dbName).collection('passwords');
}

function encryptPassword(password) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `enc:v1:${iv.toString('base64')}:${tag.toString('base64')}:${encrypted.toString('base64')}`;
}

function decryptPassword(password) {
  if (typeof password !== 'string' || !password.startsWith('enc:v1:')) {
    return password;
  }

  const [, , ivValue, tagValue, encryptedValue] = password.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    encryptionKey,
    Buffer.from(ivValue, 'base64'),
  );

  decipher.setAuthTag(Buffer.from(tagValue, 'base64'));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeSite(site) {
  if (typeof site !== 'string') {
    throw createHttpError(400, 'Site is required');
  }

  const trimmedSite = site.trim();
  if (trimmedSite.length < 3) {
    throw createHttpError(400, 'Site must be at least 3 characters long');
  }

  const siteWithProtocol = /^https?:\/\//i.test(trimmedSite)
    ? trimmedSite
    : `https://${trimmedSite}`;

  try {
    return new URL(siteWithProtocol).toString();
  } catch {
    throw createHttpError(400, 'Site must be a valid URL or domain');
  }
}

function normalizeString(value, fieldName, minLength = 1) {
  if (typeof value !== 'string') {
    throw createHttpError(400, `${fieldName} is required`);
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length < minLength) {
    throw createHttpError(400, `${fieldName} must be at least ${minLength} characters long`);
  }

  return trimmedValue;
}

function normalizeId(id) {
  if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(id)) {
    throw createHttpError(400, 'A valid password id is required');
  }

  return id;
}

function normalizeCreatePayload(payload, userId) {
  if (!userId) {
    throw createHttpError(401, 'Unauthorized: X-User-Id header is required');
  }
  return {
    id: payload.id ? normalizeId(payload.id) : crypto.randomUUID(),
    userId: userId,
    site: normalizeSite(payload.site),
    username: normalizeString(payload.username, 'Username', 1),
    password: encryptPassword(normalizeString(payload.password, 'Password', 4)),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function normalizeUpdatePayload(payload) {
  const update = {
    updatedAt: new Date(),
  };

  if (Object.hasOwn(payload, 'site')) {
    update.site = normalizeSite(payload.site);
  }

  if (Object.hasOwn(payload, 'username')) {
    update.username = normalizeString(payload.username, 'Username', 1);
  }

  if (Object.hasOwn(payload, 'password')) {
    update.password = encryptPassword(normalizeString(payload.password, 'Password', 4));
  }

  if (Object.keys(update).length === 1) {
    throw createHttpError(400, 'At least one field is required to update');
  }

  return update;
}

function serializeRecord(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    site: record.site,
    username: record.username,
    password: decryptPassword(record.password),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, hash] = storedHash.split(':');
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === checkHash;
}

function getUsersCollection() {
  return client.db(dbName).collection('users');
}

async function signupUser(req, res, next) {
  try {
    const username = normalizeString(req.body.username, 'Username', 3).toLowerCase();
    const password = normalizeString(req.body.password, 'Password', 4);

    const users = getUsersCollection();
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      throw createHttpError(409, 'Username already exists');
    }

    const passwordHash = hashPassword(password);
    const newUser = {
      username,
      passwordHash,
      createdAt: new Date(),
    };

    await users.insertOne(newUser);
    res.status(201).json({ success: true, user: { username } });
  } catch (error) {
    next(error);
  }
}

async function loginUser(req, res, next) {
  try {
    const username = normalizeString(req.body.username, 'Username', 3).toLowerCase();
    const password = normalizeString(req.body.password, 'Password', 4);

    const users = getUsersCollection();
    const user = await users.findOne({ username });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw createHttpError(401, 'Invalid username or password');
    }

    res.json({ success: true, user: { username } });
  } catch (error) {
    next(error);
  }
}

async function listPasswords(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw createHttpError(401, 'Unauthorized: X-User-Id header is required');
    }
    const records = await getCollection().find({ userId }).sort({ updatedAt: -1 }).toArray();
    res.json(records.map(serializeRecord));
  } catch (error) {
    next(error);
  }
}

async function createPassword(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    const password = normalizeCreatePayload(req.body, userId);
    await getCollection().insertOne(password);
    res.status(201).json({ success: true, password: serializeRecord(password) });
  } catch (error) {
    if (error.code === 11000) {
      next(createHttpError(409, 'A password with this id already exists'));
      return;
    }

    next(error);
  }
}

async function updatePassword(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw createHttpError(401, 'Unauthorized: X-User-Id header is required');
    }
    const id = normalizeId(req.params.id);
    const update = normalizeUpdatePayload(req.body);
    const result = await getCollection().findOneAndUpdate(
      { id, userId },
      { $set: update },
      { returnDocument: 'after' },
    );

    const updatedRecord = result.value || result;
    if (!updatedRecord) {
      throw createHttpError(404, 'Password not found or unauthorized');
    }

    res.json({ success: true, password: serializeRecord(updatedRecord) });
  } catch (error) {
    next(error);
  }
}

async function deletePassword(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      throw createHttpError(401, 'Unauthorized: X-User-Id header is required');
    }
    const id = normalizeId(req.params.id);
    const result = await getCollection().deleteOne({ id, userId });

    if (result.deletedCount === 0) {
      throw createHttpError(404, 'Password not found or unauthorized');
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Authentication routes
app.post('/api/signup', signupUser);
app.post('/api/login', loginUser);

// Passwords routes
app.get('/api/passwords', listPasswords);
app.post('/api/passwords', createPassword);
app.patch('/api/passwords/:id', updatePassword);
app.delete('/api/passwords/:id', deletePassword);

// Temporary compatibility routes for the current frontend.
app.get('/', listPasswords);
app.post('/', createPassword);
app.delete('/', (req, res, next) => {
  req.params.id = req.body.id;
  deletePassword(req, res, next);
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((error, req, res, _next) => {
  const status = error.status || 500;
  const message = status === 500 ? 'Internal server error' : error.message;

  if (status === 500) {
    console.error(error);
  }

  res.status(status).json({ error: message });
});

async function startServer() {
  await client.connect();
  await getCollection().createIndex({ id: 1 }, { unique: true });
  await getCollection().createIndex({ userId: 1 });
  await client.db(dbName).collection('users').createIndex({ username: 1 }, { unique: true });

  const server = app.listen(port, () => {
    console.log(`PassOp API listening on port ${port}`);
  });

  async function shutdown() {
    server.close(async () => {
      await client.close();
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch(async (error) => {
  console.error('Failed to start PassOp API');
  console.error(error);
  await client.close();
  process.exit(1);
});
