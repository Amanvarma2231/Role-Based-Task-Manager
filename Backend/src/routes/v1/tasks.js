// src/routes/v1/tasks.js
const express = require('express');
const { body } = require('express-validator');
const taskController = require('../../controllers/taskController');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['todo', 'in_progress', 'review', 'done'])
], taskController.createTask);

router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);

router.patch('/:id', taskController.updateTask);
router.delete('/:id', authorize('admin'), taskController.deleteTask);

module.exports = router;
