require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const prisma = new PrismaClient();
const app = express();

// Restrict CORS to development origins and the temporary deployed domain used for testing
const allowedOrigins = [
  'http://localhost:5173', // Vite default
  'http://localhost:3000',
  'http://localhost:4000',
  'http://127.0.0.1:5173',
  'https://agent-finanzas.onrender.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Origin not allowed'));
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/auth', authRoutes(prisma));
app.use('/api', apiRoutes(prisma));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
