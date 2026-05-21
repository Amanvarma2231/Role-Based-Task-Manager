// src/controllers/taskController.js
const { Task, User } = require('../models');
const { Op } = require('sequelize');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');

exports.createTask = async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user.id
    };

    // If assignedTo is provided, verify user exists
    if (taskData.assignedTo) {
      const assignedUser = await User.findByPk(taskData.assignedTo);
      if (!assignedUser) {
        return res.status(404).json({
          status: 'error',
          message: 'Assigned user not found.'
        });
      }
    }

    const task = await Task.create(taskData);

    // Invalidate tasks cache
    if (redisClient.isReady) {
      await redisClient.del('tasks:list:*');
    }

    logger.info(`Task created: ${task.id} by user: ${req.user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Task creation error:', error);
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const cacheKey = `tasks:list:${JSON.stringify(req.query)}`;

    // Try to get from cache
    if (redisClient.isReady) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return res.json({
          status: 'success',
          data: JSON.parse(cachedData)
        });
      }
    }

    // Build where clause
    const where = {};
    
    // Role-based filtering
    if (req.user.role === 'user') {
      where[Op.or] = [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: tasks } = await Task.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const result = {
      tasks,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    };

    // Cache result for 60 seconds
    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 60, JSON.stringify(result));
    }

    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    logger.error('Get tasks error:', error);
    next(error);
  }
};

exports.getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found.'
      });
    }

    // Check access rights
    if (req.user.role !== 'admin' && 
        task.createdBy !== req.user.id && 
        task.assignedTo !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view your own tasks.'
      });
    }

    res.json({
      status: 'success',
      data: { task }
    });
  } catch (error) {
    logger.error('Get task by ID error:', error);
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found.'
      });
    }

    // Check update permissions
    if (req.user.role !== 'admin' && task.createdBy !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update tasks you created.'
      });
    }

    await task.update(req.body);

    // Invalidate caches
    if (redisClient.isReady) {
      await redisClient.del(`tasks:list:*`);
      await redisClient.del(`task:${id}`);
    }

    logger.info(`Task updated: ${id} by user: ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    logger.error('Update task error:', error);
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByPk(id);

    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found.'
      });
    }

    // Only admin or creator can delete
    if (req.user.role !== 'admin' && task.createdBy !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete tasks you created.'
      });
    }

    await task.destroy();

    // Invalidate caches
    if (redisClient.isReady) {
      await redisClient.del(`tasks:list:*`);
      await redisClient.del(`task:${id}`);
    }

    logger.info(`Task deleted: ${id} by user: ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Task deleted successfully'
    });
  } catch (error) {
    logger.error('Delete task error:', error);
    next(error);
  }
};

// Admin specific endpoints
exports.getTaskStats = async (req, res, next) => {
  try {
    const stats = await Task.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const userStats = await Task.findAll({
      attributes: [
        'assignedTo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'taskCount']
      ],
      group: ['assignedTo'],
      include: [{
        model: User,
        as: 'assignee',
        attributes: ['name', 'email']
      }]
    });

    res.json({
      status: 'success',
      data: {
        tasksByStatus: stats,
        tasksByUser: userStats
      }
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    next(error);
  }
};