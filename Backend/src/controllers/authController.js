// src/controllers/authController.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        status: 'error',
        message: 'User already exists with this email.'
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Store refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    // Cache user in Redis
    if (redisClient.isReady) {
      await redisClient.setEx(
        `user:${user.id}`,
        3600,
        JSON.stringify(user.toJSON())
      );
    }

    logger.info(`New user registered: ${user.email}`);

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: user.toJSON(),
        ...tokens
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated. Contact administrator.'
      });
    }

    // Generate tokens
    const tokens = generateTokens(user.id);

    // Update refresh token and last login
    await user.update({
      refreshToken: tokens.refreshToken,
      lastLogin: new Date()
    });

    // Cache user
    if (redisClient.isReady) {
      await redisClient.setEx(
        `user:${user.id}`,
        3600,
        JSON.stringify(user.toJSON())
      );
    }

    logger.info(`User logged in: ${user.email}`);

    res.json({
      status: 'success',
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        ...tokens
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token is required.'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findByPk(decoded.id);
    
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token.'
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user.id);
    await user.update({ refreshToken: tokens.refreshToken });

    res.json({
      status: 'success',
      data: tokens
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await req.user.update({ refreshToken: null });

    // Clear cache
    if (redisClient.isReady) {
      await redisClient.del(`user:${req.user.id}`);
    }

    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
};