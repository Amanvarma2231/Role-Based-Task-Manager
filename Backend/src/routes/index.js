// src/routes/index.js
const express = require('express');
const authRoutes = require('./v1/auth');
const taskRoutes = require('./v1/tasks');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;
