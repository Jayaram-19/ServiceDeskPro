const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 20, // Huge limit in dev
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 10000 : 300, // Huge limit in dev
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, generalLimiter };
