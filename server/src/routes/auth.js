const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../utils/email');

module.exports = (prisma) => {
  const router = express.Router();

  router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.create({ data: { email, password: hashed, name } });
      return res.json({ id: user.id, email: user.email, name: user.name });
    } catch (e) {
      return res.status(400).json({ error: 'Email exists' });
    }
  });

  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'change_this_secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });

  router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ ok: true });
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
    await prisma.passwordReset.create({ data: { userId: user.id, token, expiresAt } });
    try {
      await sendResetEmail(email, token);
    } catch (e) {
      console.warn('Email failed', e);
    }
    return res.json({ ok: true });
  });

  router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    const rec = await prisma.passwordReset.findUnique({ where: { token } });
    if (!rec || rec.used || rec.expiresAt < new Date()) return res.status(400).json({ error: 'Invalid token' });
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: rec.userId }, data: { password: hashed } });
    await prisma.passwordReset.update({ where: { token }, data: { used: true } });
    return res.json({ ok: true });
  });

  return router;
};
