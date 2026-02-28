const express = require('express');
const auth = require('../middleware/auth');

module.exports = (prisma) => {
  const router = express.Router();

  // Protected route example: get current user
  router.get('/me', auth, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, email: true, name: true } });
    res.json(user);
  });

  // Transactions
  router.get('/transactions', auth, async (req, res) => {
    const list = await prisma.transaction.findMany({ where: { userId: req.user.id } });
    res.json(list);
  });

  router.post('/transactions', auth, async (req, res) => {
    const data = req.body;
    const tx = await prisma.transaction.create({ data: { ...data, userId: req.user.id } });
    res.json(tx);
  });

  // Accounts
  router.get('/accounts', auth, async (req, res) => {
    const acc = await prisma.account.findMany({ where: { userId: req.user.id } });
    res.json(acc);
  });

  router.post('/accounts', auth, async (req, res) => {
    const a = await prisma.account.create({ data: { ...req.body, userId: req.user.id } });
    res.json(a);
  });

  // Categories
  router.get('/categories', auth, async (req, res) => {
    const c = await prisma.category.findMany({ where: { OR: [{ userId: req.user.id }, { userId: null }] } });
    res.json(c);
  });

  // Budgets
  router.get('/budgets', auth, async (req, res) => {
    const b = await prisma.budget.findMany({ where: { userId: req.user.id } });
    res.json(b);
  });

  // Goals
  router.get('/goals', auth, async (req, res) => {
    const g = await prisma.goal.findMany({ where: { userId: req.user.id } });
    res.json(g);
  });

  return router;
};
