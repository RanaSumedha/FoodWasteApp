require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'))
);

// DB health check middleware
app.use((req, res, next) => {

  if (req.path === '/health') {
    return next();
  }

  if (mongoose.connection.readyState !== 1) {

    return res.status(503).json({
      error: 'DATABASE_UNAVAILABLE',
      message: 'Database not connected. Please check MongoDB.'
    });

  }

  next();
});

// Routes
app.use('/auth', require('./routes/auth'));

app.use('/users', require('./routes/users'));

app.use('/listings', require('./routes/listings'));

app.use('/claims', require('./routes/claims'));

app.use('/ratings', require('./routes/ratings'));

app.use('/notifications', require('./routes/notifications'));

app.use('/admin', require('./routes/admin'));

// Health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// MongoDB Connection
const connectDB = async () => {

  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log('✅ MongoDB Connected');

  } catch (error) {

    console.log(
      '❌ MongoDB connection failed:',
      error.message
    );

    console.log('Retrying in 5 seconds...');

    setTimeout(connectDB, 5000);
  }
};

connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;