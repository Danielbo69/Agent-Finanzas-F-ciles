require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes(prisma));
app.use('/api', apiRoutes(prisma));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
